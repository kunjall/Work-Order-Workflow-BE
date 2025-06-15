const { Sequelize } = require("sequelize");
const { MaterialsMaster } = require("../models/wow_material_master.js");
const { ServicesMaster } = require("../models/wow_services_master.js");
const { VendorsMaster } = require("../models/wow_vendors_master.js");
const { InventoryStock } = require("../models/wow_inventory_stock.js");
const { LocatorMaster } = require("../models/wow_locator_master.js");
const { LocatorStock } = require("../models/wow_locator_stock.js");
const { WarehouseMaster } = require("../models/wow_warehouse_master.js");
const { Customer } = require("../models/wow_customer.js");
const {
  ClientWarehouseMaster,
} = require("../models/wow_client_warehouse_master.js");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

// Get all materials
const getAllMaterials = async (req, res) => {
  try {
    const materials = await MaterialsMaster.findAll();
    res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get material by ID
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await MaterialsMaster.findByPk(id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json(material);
  } catch (error) {
    console.error("Error fetching material:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new material
const createMaterial = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log(req.body);
    const { item_id, item_name, item_uom, item_company, item_rate } = req.body;

    // Check if material already exists
    const existingMaterial = await MaterialsMaster.findByPk(item_id, {
      transaction,
    });

    if (existingMaterial) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Material with this ID already exists" });
    }

    // Create material in material master
    const newMaterial = await MaterialsMaster.create(
      {
        item_id,
        item_name,
        item_uom,
        item_company,
        item_rate,
      },
      { transaction }
    );

    const lastRecord = await InventoryStock.findOne({
      order: [["id", "DESC"]],
      attributes: ["id"],
    });

    const nextId = lastRecord ? lastRecord.id + 1 : 1;

    // Add to inventory stock with stock_qty = 0
    await InventoryStock.create(
      {
        id: nextId,
        material_id: item_id,
        material_stock: 0,
        material_desc: item_name,
        material_uom: item_uom,
        company: item_company,
        material_rate: item_rate,
      },
      { transaction }
    );

    // Get all locator names
    const locators = await LocatorMaster.findAll(
      {
        attributes: ["locator_name"],
        group: ["locator_name"],
      },
      { transaction }
    );

    const lastRecordLocator = await LocatorStock.findOne({
      order: [["id", "DESC"]],
      attributes: ["id"],
    });

    let nextIdLocator = lastRecordLocator ? lastRecordLocator.id + 1 : 1;

    // Add material to each locator with stock_qty = 0
    for (const locator of locators) {
      await LocatorStock.create(
        {
          id: nextIdLocator++,
          locator_name: locator.locator_name,
          material_id: item_id,
          stock_qty: 0,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json(newMaterial);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating material:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update material
const updateMaterial = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { item_name, item_uom, item_company, item_rate } = req.body;

    // Update material in material master
    const [updated] = await MaterialsMaster.update(
      {
        item_name,
        item_uom,
        item_company,
        item_rate,
      },
      {
        where: { item_id: id },
        transaction,
      }
    );

    if (updated === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Material not found" });
    }

    // Update material description and other fields in inventory stock
    await InventoryStock.update(
      {
        material_desc: item_name,
        material_uom: item_uom,
        company: item_company,
        material_rate: item_rate,
      },
      {
        where: { material_id: id },
        transaction,
      }
    );

    await transaction.commit();
    res.status(200).json({ message: "Material updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating material:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete material
const deleteMaterial = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Delete from material master
    const deleted = await MaterialsMaster.destroy({
      where: { item_id: id },
      transaction,
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Material not found" });
    }

    // Delete from inventory stock
    await InventoryStock.destroy({
      where: { material_id: id },
      transaction,
    });

    // Delete from locator stock
    await LocatorStock.destroy({
      where: { material_id: id },
      transaction,
    });

    await transaction.commit();
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Service Master CRUD operations

// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await ServicesMaster.findAll();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ServicesMaster.findByPk(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new service
const createService = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      service_id,
      service_description,
      service_UOM,
      service_rate,
      service_company,
    } = req.body;

    // Check if service already exists
    const existingService = await ServicesMaster.findByPk(service_id, {
      transaction,
    });

    if (existingService) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Service with this ID already exists" });
    }

    // Create service in service master
    const newService = await ServicesMaster.create(
      {
        service_id,
        service_description,
        service_UOM,
        service_rate,
        service_company,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(newService);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update service
const updateService = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { service_description, service_UOM, service_rate, service_company } =
      req.body;

    // Update service in service master
    const [updated] = await ServicesMaster.update(
      {
        service_description,
        service_UOM,
        service_rate,
        service_company,
      },
      {
        where: { service_id: id },
        transaction,
      }
    );

    if (updated === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Service not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Service updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete service
const deleteService = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Delete from service master
    const deleted = await ServicesMaster.destroy({
      where: { service_id: id },
      transaction,
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Service not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Vendor Master CRUD operations

// Get all vendors
const getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorsMaster.findAll();
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await VendorsMaster.findByPk(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new vendor
const createVendor = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      vendor_id,
      vendor_name,
      vendor_location,
      vendor_gst_no,
      vendor_pan,
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await VendorsMaster.findByPk(vendor_id, {
      transaction,
    });

    if (existingVendor) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Vendor with this ID already exists" });
    }

    // Create vendor in vendor master
    const newVendor = await VendorsMaster.create(
      {
        vendor_id,
        vendor_name,
        vendor_location,
        vendor_gst_no,
        vendor_pan,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(newVendor);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { vendor_name, vendor_location, vendor_gst_no, vendor_pan } =
      req.body;

    // Update vendor in vendor master
    const [updated] = await VendorsMaster.update(
      {
        vendor_name,
        vendor_location,
        vendor_gst_no,
        vendor_pan,
      },
      {
        where: { vendor_id: id },
        transaction,
      }
    );

    if (updated === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Vendor not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Vendor updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete vendor
const deleteVendor = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Delete from vendor master
    const deleted = await VendorsMaster.destroy({
      where: { vendor_id: id },
      transaction,
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Vendor not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting vendor:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllLocators = async (req, res) => {
  try {
    const locators = await LocatorMaster.findAll();
    res.status(200).json(locators);
  } catch (error) {
    console.error("Error fetching locators:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get locator by ID
const getLocatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const locator = await LocatorMaster.findByPk(id);

    if (!locator) {
      return res.status(404).json({ message: "Locator not found" });
    }

    res.status(200).json(locator);
  } catch (error) {
    console.error("Error fetching locator:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new locator
// const createLocator = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const { vendor_name, locator_name, type, internal_external, city } =
//       req.body;

//     // Check if locator name already exists
//     const existingLocator = await LocatorMaster.findOne({
//       where: { locator_name },
//       transaction,
//     });

//     if (existingLocator) {
//       await transaction.rollback();
//       return res
//         .status(400)
//         .json({ message: "Locator with this name already exists" });
//     }

//     // Get the next ID
//     const lastRecord = await LocatorMaster.findOne({
//       order: [["id", "DESC"]],
//       attributes: ["id"],
//     });

//     const nextId = lastRecord ? parseInt(lastRecord.id) + 1 : 1;

//     // Create locator in locator master
//     const newLocator = await LocatorMaster.create(
//       {
//         id: nextId,
//         vendor_name,
//         locator_name,
//         type,
//         internal_external,
//         city,
//       },
//       { transaction }
//     );

//     await transaction.commit();
//     res.status(201).json(newLocator);
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error creating locator:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const createLocator = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { vendor_name, locator_name, type, internal_external, city } =
      req.body;

    // Check if locator name already exists
    const existingLocator = await LocatorMaster.findOne({
      where: { locator_name },
      transaction,
    });

    if (existingLocator) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Locator with this name already exists" });
    }

    // Get the next ID
    const lastRecord = await LocatorMaster.findOne({
      order: [["id", "DESC"]],
      attributes: ["id"],
    });

    const nextId = lastRecord ? parseInt(lastRecord.id) + 1 : 1;

    // Create locator in locator master
    const newLocator = await LocatorMaster.create(
      {
        id: nextId,
        vendor_name,
        locator_name,
        type,
        internal_external,
        city,
      },
      { transaction }
    );

    // Fetch all materials from material master
    const materials = await MaterialsMaster.findAll({
      attributes: ["item_id"],
      transaction,
    });

    // Get the next ID for locator stock
    const lastRecordLocatorStock = await LocatorStock.findOne({
      order: [["id", "DESC"]],
      attributes: ["id"],
    });

    let nextIdLocatorStock = lastRecordLocatorStock
      ? parseInt(lastRecordLocatorStock.id) + 1
      : 1;

    // Create locator stock entries for each material with stock_qty = 0
    for (const material of materials) {
      await LocatorStock.create(
        {
          id: nextIdLocatorStock++,
          locator_name: locator_name,
          material_id: material.item_id,
          stock_qty: 0,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json(newLocator);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating locator:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update locator
const updateLocator = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { vendor_name, locator_name, type, internal_external, city } =
      req.body;

    // Check if locator name already exists (excluding the current locator)
    if (locator_name) {
      const existingLocator = await LocatorMaster.findOne({
        where: {
          locator_name,
          id: { [Sequelize.Op.ne]: id },
        },
        transaction,
      });

      if (existingLocator) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Another locator with this name already exists" });
      }
    }

    // Update locator in locator master
    const [updated] = await LocatorMaster.update(
      {
        vendor_name,
        locator_name,
        type,
        internal_external,
        city,
      },
      {
        where: { id },
        transaction,
      }
    );

    if (updated === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Locator not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Locator updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating locator:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete locator
const deleteLocator = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if locator has associated stock
    const locatorStock = await LocatorStock.findOne({
      where: {
        locator_name: {
          [Sequelize.Op.eq]: Sequelize.literal(
            `(SELECT locator_name FROM "WOW"."wow-locator-master" WHERE id = ${id})`
          ),
        },
      },
      transaction,
    });

    if (locatorStock) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Cannot delete locator with associated stock. Please remove stock first.",
      });
    }

    // Delete from locator master
    const deleted = await LocatorMaster.destroy({
      where: { id },
      transaction,
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Locator not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Locator deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting locator:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await WarehouseMaster.findAll();
    res.status(200).json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get warehouse by ID
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await WarehouseMaster.findByPk(id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.status(200).json(warehouse);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new warehouse
const createWarehouse = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { warehouse_id, warehouse_city } = req.body;

    // Check if warehouse already exists
    const existingWarehouse = await WarehouseMaster.findByPk(warehouse_id, {
      transaction,
    });

    if (existingWarehouse) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Warehouse with this ID already exists" });
    }

    // Create warehouse in warehouse master
    const newWarehouse = await WarehouseMaster.create(
      {
        warehouse_id,
        warehouse_city,
      },
      { transaction }
    );

    // Fetch all materials from material master
    const materials = await MaterialsMaster.findAll({
      transaction,
    });

    // Get the next ID for inventory stock
    const lastRecord = await InventoryStock.findOne({
      order: [["id", "DESC"]],
      attributes: ["id"],
    });

    let nextId = lastRecord ? parseInt(lastRecord.id) + 1 : 1;

    // Create inventory stock entries for each material with stock_qty = 0
    for (const material of materials) {
      await InventoryStock.create(
        {
          id: nextId++,
          material_id: material.item_id,
          material_stock: 0,
          material_desc: material.item_name,
          material_uom: material.item_uom,
          company: material.item_company,
          material_rate: material.item_rate,
          warehouse_id: warehouse_id,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json(newWarehouse);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update warehouse
const updateWarehouse = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { warehouse_city } = req.body;

    // Update warehouse in warehouse master
    const [updated] = await WarehouseMaster.update(
      {
        warehouse_city,
      },
      {
        where: { warehouse_id: id },
        transaction,
      }
    );

    if (updated === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Warehouse not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Warehouse updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete warehouse
const deleteWarehouse = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if warehouse has associated inventory stock
    const inventoryStock = await InventoryStock.findOne({
      where: { warehouse_id: id },
      transaction,
    });

    if (inventoryStock) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Cannot delete warehouse with associated inventory. Please remove inventory first.",
      });
    }

    // Delete from warehouse master
    const deleted = await WarehouseMaster.destroy({
      where: { warehouse_id: id },
      transaction,
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Warehouse not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      customer_id,
      customer_name,
      customer_state,
      customer_pincode,
      customer_address,
      customer_poc,
      customer_mobile,
      customer_email,
      customer_gstin,
    } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findByPk(customer_id, {
      transaction,
    });

    if (existingCustomer) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Customer with this ID already exists" });
    }

    // Handle empty string for mobile number
    const mobileValue = customer_mobile || null;

    // Create customer
    const newCustomer = await Customer.create(
      {
        customer_id,
        customer_name,
        customer_state,
        customer_pincode,
        customer_address,
        customer_poc,
        customer_mobile: mobileValue,
        customer_email,
        customer_gstin,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(newCustomer);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_state,
      customer_pincode,
      customer_address,
      customer_poc,
      customer_mobile,
      customer_email,
      customer_gstin,
    } = req.body;

    // Handle empty string for mobile number
    const mobileValue = customer_mobile || null;

    // Update customer
    const [updated] = await Customer.update(
      {
        customer_name,
        customer_state,
        customer_pincode,
        customer_address,
        customer_poc,
        customer_mobile: mobileValue,
        customer_email,
        customer_gstin,
      },
      {
        where: { customer_id: id },
        transaction,
      }
    );

    if (updated === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Customer not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Delete customer
    const deleted = await Customer.destroy({
      where: { customer_id: id },
      transaction,
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Customer not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllClientWarehouses = async (req, res) => {
  try {
    const clientWarehouses = await ClientWarehouseMaster.findAll();
    res.status(200).json(clientWarehouses);
  } catch (error) {
    console.error("Error fetching client warehouses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get client warehouse by ID
const getClientWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientWarehouse = await ClientWarehouseMaster.findByPk(id);

    if (!clientWarehouse) {
      return res.status(404).json({ message: "Client warehouse not found" });
    }

    res.status(200).json(clientWarehouse);
  } catch (error) {
    console.error("Error fetching client warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new client warehouse
const createClientWarehouse = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { warehouse_id, warehouse_city, warehouse_company } = req.body;

    // Check if client warehouse already exists
    const existingClientWarehouse = await ClientWarehouseMaster.findByPk(
      warehouse_id,
      {
        transaction,
      }
    );

    if (existingClientWarehouse) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Client warehouse with this ID already exists" });
    }

    // Create client warehouse
    const newClientWarehouse = await ClientWarehouseMaster.create(
      {
        warehouse_id,
        warehouse_city,
        warehouse_company,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(newClientWarehouse);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating client warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update client warehouse
const updateClientWarehouse = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { warehouse_city, warehouse_company } = req.body;

    // Update client warehouse
    const [updated] = await ClientWarehouseMaster.update(
      {
        warehouse_city,
        warehouse_company,
      },
      {
        where: { warehouse_id: id },
        transaction,
      }
    );

    if (updated === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client warehouse not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Client warehouse updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating client warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete client warehouse
const deleteClientWarehouse = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Delete client warehouse
    const deleted = await ClientWarehouseMaster.destroy({
      where: { warehouse_id: id },
      transaction,
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client warehouse not found" });
    }

    await transaction.commit();
    res.status(200).json({ message: "Client warehouse deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting client warehouse:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteVendor,
  updateVendor,
  createVendor,
  getAllVendors,
  getVendorById,
  getAllLocators,
  getLocatorById,
  createLocator,
  updateLocator,
  deleteLocator,
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllClientWarehouses,
  getClientWarehouseById,
  createClientWarehouse,
  updateClientWarehouse,
  deleteClientWarehouse,
};
