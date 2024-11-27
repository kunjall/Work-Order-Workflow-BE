const { MaterialInventory } = require("../models/wow_material_inventory.js");
const { InventoryInward } = require("../models/wow_inventory_inward");

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

module.exports = {
  enterInventoryMaterial,
  enterInventory,
};
