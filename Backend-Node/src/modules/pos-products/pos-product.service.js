const axios = require('axios');
const PosProduct = require('./pos-product.model');
const logger = require('../../config/logger');
const { POS_PRODUCTS_URL } = require('../../config/env');

class PosProductService {
  async syncProducts(locno = 0) {
    const pageSize = 500;
    let offset = 0;
    let totalImported = 0;

    try {
      while (true) {
        const response = await axios.post(POS_PRODUCTS_URL, {
          mode: '0',
          locno: String(locno),
          deptId: '0',
          groupId: '0',
          subgroupId: '0',
          brandId: '0',
          catId: '0',
          designId: '0',
          colorId: '0',
          sizeId: '0',
          makeId: '0',
          suppId: '',
          bDefault: '0',
          query: '',
          offset,
          pagesize: pageSize,
        }, {
          headers: { 'ConStr': 'ConStr2', 'Content-Type': 'application/json' },
          timeout: 60000,
        });

        const items = response.data;
        if (!items || !Array.isArray(items) || items.length === 0) break;

        for (const item of items) {
          await PosProduct.findOneAndUpdate(
            { item_code: item.ITEM_CODE, locno },
            {
              item_code: item.ITEM_CODE,
              bar_code: item.BAR_CODE || '',
              name: item.ITEM_DESC,
              description: item.ITEM_DESC_LONG,
              department: item.DEPT_NAME,
              group: item.GRNAME,
              supplier: item.SUPP_NAME,
              brand: item.BRAND_DESC,
              price: item.UNIT_PRICE,
              discount_price: item.DISC_PRICE,
              cost: item.AVG_COST,
              quantity: item.QTY,
              is_available: item.IsAvailable,
              uom: item.UOM,
              pack_desc: item.PACK_DESC,
              image_path: item.IMAGE_PATH,
              thumbnail_path: item.THUMBNAIL_PATH,
              locno,
            },
            { upsert: true, new: true }
          );
        }

        totalImported += items.length;
        offset += pageSize;

        if (items.length < pageSize) break;
      }

      logger.info(`POS products synced: ${totalImported} total`);
      return { total: totalImported };
    } catch (error) {
      logger.error('POS product sync failed:', error.message);
      throw new Error('Failed to sync POS products: ' + error.message);
    }
  }
}

module.exports = new PosProductService();
