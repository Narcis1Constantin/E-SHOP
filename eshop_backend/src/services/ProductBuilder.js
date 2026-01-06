const Product = require("./Product");

class ProductBuilder {

    setId(id) {
        this.id = id;
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    setPriceCents(price_cents) {
        this.price = price_cents / 100;
        return this;
    }

    setStock(stock) {
        this.stock = stock;
        return this;
    }

    setBrand(brand) {
        this.brand = brand;
        return this;
    }

    setCategory(category) {
        this.category = category;
        return this;
    }

    setImageUrl(image_url) {
        this.imageUrl = image_url;
        return this;
    }

    setDescription(description) {
        this.description = description;
        return this;
    }

    setDiscountPercentage(discount_percentage) {
        this.discountPercentage = discount_percentage || 0;
        return this;
    }

    setIsRefurbished(is_refurbished) {
        this.isRefurbished = is_refurbished || false;
        return this;
    }

    setCreatedAt(created_at) {
        this.createdAt = created_at;
        return this;
    }

    build() {
        return new Product(this);
    }
}

module.exports = ProductBuilder;