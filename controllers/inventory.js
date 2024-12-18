const { MaterialInventory } = require("../models/wow_material_inventory.js");
const { InventoryInward } = require("../models/wow_inventory_inward");
const { where } = require("sequelize");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
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
// require("../models/associations.js");

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
    inventory_receiver_name,
    inventory_receiver_email,
  } = req.body;

  try {
    // Create a new material record
    const response = await InventoryInward.create(
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
        inventory_receiver_name,
        inventory_receiver_email,
        created_by,
        created_at,
      },
      { logging: console.log }
    );

    res.status(201).json(response.inventory_id);
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
    inventory_id,
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
      inventory_id,
    });

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const getInventoryInwardReciever = async (req, res) => {
//   try {
//     const user = req.query.user;
//     const inventorystatus = req.query.inventorystatus;

//     // Input validation
//     if (!user || !inventorystatus) {
//       return res
//         .status(400)
//         .json({ message: "User and inventory status are required." });
//     }

//     // Define the raw SQL query with a LEFT JOIN
//     // Execute the query
//     const [results, metadata] = await sequelize.query(`
//       SELECT a.*, b.*
//       FROM "WOW"."wow-inventory-inward" a
//       LEFT JOIN "WOW"."wow-material-inventory" b ON a.inventory_id = b.inventory_id
//       WHERE a.inventory_inward_status = '${inventorystatus}'
//       AND (a.inventory_receiver_email = '${user}' OR a.inventory_approver_email = '${user}' OR a.created_by = '${user}');
//     `);
//     // Return the data
//     if (results.length === 0) {
//       return res.status(200).json({ message: "No inventory found." });
//     }

//     res.status(200).json(results);
//   } catch (error) {
//     console.error("Error fetching inventory:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

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

    // Define filter conditions based on inventory status
    const whereCondition = {
      inventory_inward_status: inventorystatus,
      [Op.or]: [
        { inventory_receiver_email: user },
        { inventory_approver_email: user },
        { created_by: user },
      ],
    };

    // Fetch inventory data
    const foundInventory = await InventoryInward.findAll({
      where: whereCondition,
    });

    // Return the data
    if (!foundInventory || foundInventory.length === 0) {
      return res.status(200).json({ message: "No inventory found." });
    }

    res.status(200).json(foundInventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getInventoryMaterialInventory = async (req, res) => {
  try {
    const inventory_id = req.query.inventory_id;

    // Input validation
    if (!inventory_id) {
      return res
        .status(400)
        .json({ message: "User and inventory status are required." });
    }
    const foundInventoryMaterial = await MaterialInventory.findAll({
      where: {
        inventory_id: inventory_id,
      },
    });

    if (foundInventoryMaterial.length === 0) {
      return res.status(200).json({ message: "No material records found." });
    }

    res.json(foundInventoryMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllInventoryMaterial = async (req, res) => {
  try {
    // Input validation

    const foundInventoryMaterial = await MaterialInventory.findAll();

    if (foundInventoryMaterial.length === 0) {
      return res.status(200).json({ message: "No material records found." });
    }

    res.json(foundInventoryMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateReceivedDetails = async (req, res) => {
  try {
    const {
      inventory_id,
      inventory_inward_status,
      received_at,
      received_by,
      inventory_approver_email,
      inventory_approver_name,
      receiver_comments,
    } = req.body;

    if (!inventory_id) {
      return res.status(400).json({ message: "Inventory ID is required" });
    }

    const result = await InventoryInward.update(
      {
        inventory_inward_status,
        received_at,
        received_by,
        inventory_approver_email,
        inventory_approver_name,
        receiver_comments,
      },
      {
        where: { inventory_id },
      }
    );

    if (result[0] === 0) {
      // No rows updated
      return res.status(404).json({ message: "Inventory record not found" });
    }

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateApprovedDetails = async (req, res) => {
  try {
    const {
      inventory_id,
      inventory_inward_status,
      approved_at,
      approved_by,
      approver_comments,
    } = req.body;

    if (!inventory_id) {
      return res.status(400).json({ message: "Inventory ID is required" });
    }

    const result = await InventoryInward.update(
      {
        inventory_inward_status,
        approved_at,
        approved_by,
        approver_comments,
      },
      {
        where: { inventory_id },
      }
    );

    if (result[0] === 0) {
      // No rows updated
      return res.status(404).json({ message: "Inventory record not found" });
    }

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  enterInventoryMaterial,
  enterInventory,
  getInventoryInwardReciever,
  getInventoryMaterialInventory,
  getAllInventoryMaterial,
  updateReceivedDetails,
  updateApprovedDetails,
};
