const { MaterialInventory } = require("../models/wow_material_inventory.js");
const { InventoryInward } = require("../models/wow_inventory_inward");
const { where } = require("sequelize");
const { Op } = require("sequelize");

const enterInventory = async (req, res) => {
  const {
    customer_dc_number,
    customer_id,
    customer_name,
    warehouse_id,
    warehouse_city,
    entry_date,
    dc_date,
    eway_bill_number,
    mrs_number,
    mrs_date,
    client_warehouse_id,
    client_warehouse_city,
    inventory_inward_status,
    created_by,
    created_at,
    inventory_reviewer_name,
    inventory_reviewer_email,
  } = req.body;

  try {
    // Create a new material record
    await InventoryInward.create(
      {
        customer_dc_number,
        customer_id,
        customer_name,
        warehouse_id,
        warehouse_city,
        entry_date,
        dc_date,
        eway_bill_number,
        mrs_number,
        mrs_date,
        client_warehouse_id,
        client_warehouse_city,
        inventory_inward_status,
        inventory_reviewer_name,
        inventory_reviewer_email,
        created_by,
        created_at,
      },
      { logging: console.log }
    );

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const enterInventoryMaterial = async (req, res) => {
  const {
    record_id,
    customer_dc_number,
    material_id,
    material_desc,
    material_uom,
    material_wo_qty,
  } = req.body;

  try {
    // Create a new material record
    await MaterialInventory.create({
      record_id,
      customer_dc_number,
      material_id,
      material_desc,
      material_uom,
      material_wo_qty,
    });

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInventoryInwardReciever = async (req, res) => {
  try {
    const user = req.query.user;
    const inventorystatus = req.query.inventorystatus;

    // Input validation
    if (!user || !inventorystatus) {
      return res
        .status(400)
        .json({ message: "User and inventory status are required." });
    }
    // Fetch inventory data
    const foundInventory = await InventoryInward.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              { inventory_reviewer_email: user },
              { inventory_inward_status: inventorystatus },
            ],
          },
          {
            [Op.and]: [
              { inventory_approver_email: user },
              { inventory_inward_status: inventorystatus },
            ],
          },
        ],
      },
    });

    // Check if data was found
    if (foundInventory.length === 0) {
      return res.status(404).json({ message: "No inventory records found." });
    }

    // Return found data
    res.json(foundInventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  enterInventoryMaterial,
  enterInventory,
  getInventoryInwardReciever,
};
