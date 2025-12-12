from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BenchmarkStatsBase(BaseModel):
    dept_id: int
    month: datetime
    collection_id: int
    aggregate: float
    stat_total: int
    prog_total: int

class BenchmarkStats(BenchmarkStatsBase):
    class Config:
        from_attributes = True

class BenchmarkAgg(BaseModel):
    month: datetime
    collection_id: int
    aggregate: float
    stat_total: int
