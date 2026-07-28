const Product = require('../products/product.model');
const { successResponse } = require('../../utils/api-response');

async function storeGroceryProducts(req, res, next) {
  try {
    const axios = require('axios');
    const response = await axios.post('https://cyberneticonline.com/webapi/api/product/getProductList', {
      mode: '0', locno: '1', deptId: '0', groupId: '0', subgroupId: '0',
      brandId: '0', catId: '0', designId: '0', colorId: '0', sizeId: '0',
      makeId: '0', suppId: '', bDefault: '0', query: '', offset: '0', pagesize: '10000',
    }, { headers: { ConStr: 'ConStr2' }, timeout: 600000 });

    if (response.data) {
      const products = response.data;
      for (const product of products) {
        const productName = (product.ITEM_DESC + ' - ' + product.PACK_DESC).trim();
        const existing = await Product.findOne({ title: productName });
        if (existing) {
          existing.title = productName;
          existing.description = product.ITEM_DESC_LONG + ' - ' + product.PACK_DESC;
          existing.price = product.UNIT_PRICE;
          await existing.save();
        } else {
          await Product.create({
            title: productName,
            description: product.ITEM_DESC_LONG + ' - ' + product.PACK_DESC,
            image: null, price: product.UNIT_PRICE, business_id: 6, type: 'grocery',
          });
        }
      }
      res.json({ message: 'Products imported successfully, avoiding duplicates.' });
    } else {
      res.status(500).json({ message: 'Failed to fetch products from API.' });
    }
  } catch (error) { next(error); }
}

module.exports = { storeGroceryProducts };
