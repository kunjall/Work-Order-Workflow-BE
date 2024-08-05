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

module.exports = {
  findCustomer,
  findCity,
};
