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
        // convertim cenți în lei (sau ce unitate folosiți)
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

    setCreatedAt(created_at) {
        this.createdAt = created_at;
        return this;
    }

    build() {
        return new Product(this);
    }
}

module.exports = ProductBuilder;
