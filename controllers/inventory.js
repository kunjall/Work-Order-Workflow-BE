const { MaterialInventory } = require("../models/wow_material_inventory.js");
const { InventoryInward } = require("../models/wow_inventory_inward");
const { InventoryStock } = require("../models/wow_inventory_stock.js");
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
    materials, // Array of material entries [{ material_id, material_wo_qty, material_desc, material_uom }]
  } = req.body;

  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    // Step 1: Insert into InventoryInward
    const inventory = await InventoryInward.create(
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
      { transaction }
    );

    // Step 2: Process each material entry
    for (const material of materials) {
      const { material_id, material_wo_qty, material_desc, material_uom } =
        material;

      // Insert into MaterialInventory
      await MaterialInventory.create(
        {
          record_id: `${inventory.inventory_id}-${material_id}`, // Example composite ID
          customer_dc_number,
          material_id,
          material_desc,
          material_uom,
          material_wo_qty,
          inventory_id: inventory.inventory_id,
        },
        { transaction }
      );

      // Update material_stock in WowInventoryStock
      await InventoryStock.increment(
        { material_stock: material_wo_qty }, // Increment material_stock by material_wo_qty
        {
          where: { material_id },
          transaction,
        }
      );
    }

    // Commit the transaction if all operations succeed
    await transaction.commit();

    res.status(201).json({ inventory_id: inventory.inventory_id });
  } catch (error) {
    // Rollback the transaction if any operation fails
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInventoryInwardReciever = async (req, res) => {
  try {
    const user = req.query.user;
    const inventorystatus = req.query.inventorystatus;

    if (!user || !inventorystatus) {
      return res
        .status(400)
        .json({ message: "User and inventory status are required." });
    }

    const whereCondition = {
      inventory_inward_status: inventorystatus,
      [Op.or]: [
        { inventory_receiver_email: user },
        { inventory_approver_email: user },
        { created_by: user },
      ],
    };

    const foundInventory = await InventoryInward.findAll({
      where: whereCondition,
    });

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
      return res.status(404).json({ message: "Inventory record not found" });
    }

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  // enterInventoryMaterial,
  enterInventory,
  getInventoryInwardReciever,
  getInventoryMaterialInventory,
  getAllInventoryMaterial,
  updateReceivedDetails,
  updateApprovedDetails,
};
