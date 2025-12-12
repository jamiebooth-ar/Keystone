from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PageTemplateBase(BaseModel):
    title: Optional[str] = None
    content: str
    domains: int
    mode: int

class PageTemplateCreate(PageTemplateBase):
    pass

class PageTemplate(PageTemplateBase):
    id: int
    created_on: datetime
    modified_on: datetime
    archived: bool
    class Config:
        from_attributes = True

class BespokePageBase(BaseModel):
    type_id: int
    title: str
    sub_heading: Optional[str] = None
    image_source: Optional[str] = None
    url: Optional[str] = None
    domain_flag: int
    hidden: bool = False

class BespokePageCreate(BespokePageBase):
    pass

class BespokePage(BespokePageBase):
    id: int
    class Config:
        from_attributes = True
