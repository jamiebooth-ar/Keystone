
import logging
from typing import List, Dict, Any, Optional
import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import Engine
from openai import OpenAI
import json

logger = logging.getLogger(__name__)

class DatabaseAgent:
    def __init__(self):
        # Configuration - Hardcoded for now as per user request/existing codebase references
        # Ideally these should move to .env in production
        # Get base dir (3 levels up from this file)
        # Get base dir (2 levels up from this file: app/services/ -> app/)
        # Get base dir (3 levels up from this file: app/services/ -> app/ -> backend/)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        banana_db_path = os.path.join(base_dir, 'keystone_banana.db')
        
        self.databases: Dict[str, Dict[str, str]] = {
            "banana": {
                "connection_string": f"sqlite:///{banana_db_path}",
                # SQLite doesn't need host/user/pass etc.
            },
            "cms": {
                "connection_string_template": "mssql+pyodbc://{user}:{password}@{host}/{db}?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes",
                "host": "134.213.185.96",
                "db": "fau-cms",
                "user": "scireg_ourcms",
                "password": "izjQL93FpG"
            },
            "wysiwyg": {
                "connection_string_template": "mssql+pyodbc://{user}:{password}@{host}/{db}?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes",
                "host": "134.213.185.96",
                "db": "WYSIWYG",
                "user": "scireg_ourcms",
                "password": "izjQL93FpG"
            }
        }
        
        self.engines: Dict[str, Engine] = {}
        self.schema_cache: Dict[str, List[str]] = {} # Simple cache of table names per DB
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def _get_engine(self, db_key: str) -> Engine:
        """Lazy loads database engine"""
        if db_key not in self.engines:
            config = self.databases.get(db_key)
            if not config:
                raise ValueError(f"Database configuration for '{db_key}' not found")
            
            # Check if direct connection string is provided (e.g. SQLite)
            if "connection_string" in config:
                conn_str = config["connection_string"]
            else:
                conn_str = config["connection_string_template"].format(**config)
                
            self.engines[db_key] = create_engine(conn_str)
            logger.info(f"Initialized engine for {db_key}")
            
        return self.engines[db_key]

    def _get_schema_summary(self, db_key: str) -> List[str]:
        """
        Retrieves a summary of the database schema (Table Names).
        For 'massive' databases, we only fetch table names initially.
        """
        if db_key not in self.schema_cache:
            try:
                engine = self._get_engine(db_key)
                inspector = inspect(engine)
                tables = inspector.get_table_names()
                self.schema_cache[db_key] = tables
            except Exception as e:
                logger.error(f"Failed to fetch schema for {db_key}: {e}")
                return []
        return self.schema_cache[db_key]

    def _identify_relevant_tables(self, query: str, db_key: str) -> List[str]:
        """
        Uses LLM to identify which tables are relevant to the user's query.
        This reduces the context window usage.
        """
        all_tables = self._get_schema_summary(db_key)
        
        # If very few tables, just return them all
        if len(all_tables) < 20:
            return all_tables
            
        prompt = f"""
        You are a database expert. 
        Given the user's question: "{query}"
        And this list of table names in the database:
        {json.dumps(all_tables)}
        
        Identify the top 5 most relevant table names that might contain the answer.
        Return ONLY a JSON array of strings. Example: ["users", "orders"]
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            logger.error(f"Failed to identify tables: {e}")
            # Fallback: simple keyword matching or return top 10
            return all_tables[:10]

    def _get_table_details(self, db_key: str, table_names: List[str]) -> str:
        """
        Fetches column info for specific tables to feed into the SQL generation prompt.
        """
        engine = self._get_engine(db_key)
        inspector = inspect(engine)
        schema_text = ""
        
        for table in table_names:
            try:
                columns = inspector.get_columns(table)
                col_defs = [f"{col['name']} ({col['type']})" for col in columns]
                schema_text += f"Table: {table}\nColumns: {', '.join(col_defs)}\n\n"
            except Exception as e:
                logger.warning(f"Could not inspect table {table}: {e}")
                
        return schema_text

    def process_query(self, user_query: str) -> Dict[str, Any]:
        """
        Main entry point.
        1. Select DB (naive for now: checks both or defaults to CMS)
        2. Retrieve relevant schema
        3. Generate SQL
        4. Execute
        5. Synthesize answer
        """
        # Step 1: Naive DB Selection - Default to CMS for now, or maybe try to detect?
        # TODO: Add logic to switch between 'cms' and 'wysiwyg' based on query
        target_db = "banana" 
        
        # Step 2: Retrieve Schema
        relevant_tables = self._identify_relevant_tables(user_query, target_db)
        schema_details = self._get_table_details(target_db, relevant_tables)
        
        # Step 3: Generate SQL
        system_prompt = f"""
        You are a SQLite expert.
        The underlying database is SQLite.
        Do NOT use functions like YEAR(), CURDATE(), NOW(), or DATEADD().
        Use SQLite date functions: date('now'), strftime('%Y', created_at), etc.
        Given the following database schema:
        {schema_details}
        
        Write a valid SQL query to answer the user's question: "{user_query}"
        Return ONLY the raw SQL query. Do not wrap in markdown or code blocks.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": system_prompt}],
                temperature=0
            )
            generated_sql = response.choices[0].message.content.strip().replace("```sql", "").replace("```", "")
        except Exception as e:
             return {"error": f"Failed to generate SQL: {str(e)}"}

        # Step 4: Execute
        results = []
        try:
            with self._get_engine(target_db).connect() as conn:
                result_proxy = conn.execute(text(generated_sql))
                # Convert to list of dicts
                keys = result_proxy.keys()
                results = [dict(zip(keys, row)) for row in result_proxy.fetchall()]
        except Exception as e:
             return {
                 "error": f"SQL Execution failed: {str(e)}",
                 "generated_sql": generated_sql
             }

        # Step 5: Synthesize Answer
        # If results are huge, truncate
        truncated_results = results[:10]
        
        synthesis_prompt = f"""
        User Question: "{user_query}"
        SQL Query Used: "{generated_sql}"
        Data Results: {json.dumps(truncated_results, default=str)}
        
        Provide a natural language answer to the user's question based on the data.
        """
        
        try:
            final_response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": synthesis_prompt}],
                temperature=0.3
            )
            answer = final_response.choices[0].message.content
        except Exception as e:
            answer = "I found some data but couldn't summarize it."

        return {
            "answer": answer,
            "sql": generated_sql,
            "results": results, # Return full results? Maybe limit
            "source_db": target_db
        }

# Singleton instance
db_agent = DatabaseAgent()
