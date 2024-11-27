const { MaterialsMaster } = require("../models/wow_material_master");
const { ServicesMaster } = require("../models/wow_services_master");
const { VendorsMaster } = require("../models/wow_vendors_master");
const { WarehouseMaster } = require("../models/wow_warehouse_master");
const { Customer } = require("../models/wow_customer");
const { CityProject } = require("../models/wow_city_project_mapping");
const {
  ClientWarehouseMaster,
} = require("../models/wow_client_warehouse_master");

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
      logging: console.log,
    });
    res.json(foundClientWarehouses);
  } catch (error) {
    console.error("Error finding services:", error);
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
};
