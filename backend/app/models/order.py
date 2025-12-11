from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Numeric
from app.core.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, name="OrderId")
    purchaser_id = Column(Integer, name="PurchaserId")
    purchaser_type_id = Column(Integer, name="PurchaserType") # 1 = Public
    order_total = Column(Numeric(12, 2), name="OrderTotal")
    timestamp = Column(DateTime, default=datetime.utcnow, name="TimeStamp")
    status_id = Column(Integer, name="Status") # 1 = Committed, 2 = Cancelled

    # items = relationship("OrderDetail", back_populates="order")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, name="ProductId")
    product_name = Column(String, name="ProductName")
    description = Column(String, nullable=True, name="Description")
    price = Column(Numeric(10, 2), name="Price")
    quantity = Column(Integer, name="Quantity") # Stock
    
    foreign_id = Column(Integer, name="ForeignId")
    foreign_type_id = Column(Integer, name="ForeignType") # 1 = FauEvent
    product_type_id = Column(Integer, name="ProductTypeId") # 1 = EventVisitorTicket, 2 = ConfDelegate

class OrderDetail(Base):
    __tablename__ = "order_details"
    
    id = Column(Integer, primary_key=True, index=True, name="OrderDetailId")
    order_id = Column(Integer, ForeignKey("orders.OrderId"), name="OrderId")
    product_id = Column(Integer, ForeignKey("products.ProductId"), name="ProductId")
    
    quantity = Column(Integer, name="Quantity")
    unit_price = Column(Numeric(10, 2), name="UnitPrice")
    
    # order = relationship("Order", back_populates="items")
    # product = relationship("Product")
