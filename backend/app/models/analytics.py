from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, PrimaryKeyConstraint
from app.core.database import Base
from datetime import datetime

class BenchmarkStats(Base):
    __tablename__ = "benchmark_stats"

    dept_id = Column(Integer, primary_key=True)
    month = Column(DateTime, primary_key=True)
    collection_id = Column(Integer, primary_key=True)
    
    aggregate = Column(Float)
    stat_total = Column(Integer)
    prog_total = Column(Integer)
    
    # CMS4 used a composite key, SQLAlchemy supports this natively
    __table_args__ = (
        PrimaryKeyConstraint('dept_id', 'month', 'collection_id'),
    )

class InstitutionBenchmark(Base):
    __tablename__ = "institution_benchmark"
    id = Column(Integer, primary_key=True, index=True)
    inst_id = Column(Integer)
    name = Column(Integer, nullable=True) # Matches legacy "Name" field which was an int? (InstitutionNameBenchmarkedEntity)
    is_benchmarked = Column(Integer) # 1 or 0
