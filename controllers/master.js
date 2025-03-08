const { MaterialsMaster } = require("../models/wow_material_master");
const { ServicesMaster } = require("../models/wow_services_master");
const { VendorsMaster } = require("../models/wow_vendors_master");
const { WarehouseMaster } = require("../models/wow_warehouse_master");
const { LocatorStock } = require("../models/wow_locator_stock");
const { Customer } = require("../models/wow_customer");
const { CityProject } = require("../models/wow_city_project_mapping");
const {
  ClientWarehouseMaster,
} = require("../models/wow_client_warehouse_master");
const { LocatorMaster } = require("../models/wow_locator_master");

const findCustomer = async (req, res) => {
  try {
    const foundCustomer = await Customer.findAll();
    res.json(foundCustomer);
  } catch (error) {
    console.error("Error finding customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findCity = async (req, res) => {
  try {
    const foundMapping = await CityProject.findAll();
    res.json(foundMapping);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findLocator = async (req, res) => {
  try {
    const city = req.query.city;
    const manager = req.query.manager;
    const type = req.query.manager;
    const foundMapping = await CityProject.findAll({
      where: {
        manager_name: manager,
        city_name: city,
        type: type,
      },
    });
    res.json(foundMapping);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findMaterial = async (req, res) => {
  try {
    const company = req.query.company;
    const foundMaterial = await MaterialsMaster.findAll({
      where: { item_company: company },
    });
    res.json(foundMaterial);
  } catch (error) {
    console.error("Error finding materials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findServices = async (req, res) => {
  try {
    const company = req.query.company;
    const foundServices = await ServicesMaster.findAll({
      where: { service_company: company },
    });
    res.json(foundServices);
  } catch (error) {
    console.error("Error finding services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const findVendors = async (req, res) => {
  try {
    const foundVendors = await VendorsMaster.findAll();
    res.json(foundVendors);
  } catch (error) {
    console.error("Error finding vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findWarehouses = async (req, res) => {
  try {
    const foundWarehouses = await WarehouseMaster.findAll();
    res.json(foundWarehouses);
  } catch (error) {
    console.error("Error finding warehouses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findClientWarehouses = async (req, res) => {
  try {
    const company = req.query.company;
    const foundClientWarehouses = await ClientWarehouseMaster.findAll({
      where: { warehouse_company: company },
    });
    res.json(foundClientWarehouses);
  } catch (error) {
    console.error("Error finding services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findLocatorStock = async (req, res) => {
  try {
    const { locator_name } = req.query;
    const foundMaterialStock = await LocatorStock.findAll({
      where: { locator_name },
    });
    res.json(foundMaterialStock);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findLocators = async (req, res) => {
  try {
    const { vendor_name, city, type, customer_name, internal_external } =
      req.query;

    const filter = {};
    if (vendor_name) filter.vendor_name = vendor_name;
    if (city) filter.city = city;
    if (type) filter.type = type;
    if (customer_name) filter.customer_name = customer_name;
    if (internal_external) filter.internal_external = internal_external;

    const foundLocators = await LocatorMaster.findAll({
      where: filter,
    });

    res.json(foundLocators);
  } catch (error) {
    console.error("Error finding locators:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  findMaterial,
  findServices,
  findVendors,
  findCustomer,
  findCity,
  findWarehouses,
  findClientWarehouses,
  findLocatorStock,
  findLocators,
};
