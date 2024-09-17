const { MaterialsMaster } = require("../models/wow_material_line_items_master");

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
module.exports = {
  findMaterial,
};
