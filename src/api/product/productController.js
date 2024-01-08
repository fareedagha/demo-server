const express = require('express');
const router = express.Router();
const ProductService = require('./productService');
const productService = new ProductService();

router.get('/', (req, res) => {
  productService
    .list(req.query)
    .then(products => res.send(products));
});


router.get('/:id', (req, res) => {
  productService
    .findById(req.params.id, req.query)
    .then(product => res.send(product));
});


router.delete('/:id', (req, res) => {
  productService
    .deleteProduct(req.params.id, req.product)
    .then(() => res.send({ id: req.params.id }));
});

router.post('/', (req, res) => {
  productService
    .addProduct(req.body)
    .then(product => res.send({ productId: product.productId }))
    .catch(err => res.status(400).send(err));
});

router.put('/:id', (req, res) => {
  productService
    .editProduct(req.params.id, req.body, req.product)
    .then(product => res.send(product));
});
module.exports = router;
