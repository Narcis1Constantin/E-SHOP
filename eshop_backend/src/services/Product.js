class Product {
    constructor(builder) {
        this.id = builder.id;
        this.title = builder.title;
        this.price = builder.price;
        this.stock = builder.stock;
        this.brand = builder.brand;
        this.category = builder.category;
        this.imageUrl = builder.imageUrl;
        this.description = builder.description;
        this.discountPercentage = builder.discountPercentage || 0;
        this.isRefurbished = builder.isRefurbished || false; // ← NOU
        this.createdAt = builder.createdAt;
    }
}

module.exports = Product;