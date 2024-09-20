const { MaterialsMaster } = require("../models/wow_material_line_items_master");
const { ServicesMaster } = require("../models/wow_services_line_items_master");
const { VendorsMaster } = require("../models/wow_vendors_master");
const { Customer } = require("../models/wow_customer");
const { CityProject } = require("../models/wow_city_project_mapping");

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
module.exports = {
  findMaterial,
  findServices,
  findVendors,
  findCustomer,
  findCity,
};
