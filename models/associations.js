// associations.js
const InventoryInward = require("./wow_inventory_inward"); // Import InventoryInward model
const MaterialInventory = require("./wow_material_inventory"); // Import MaterialInventory model

// Define associations
InventoryInward.hasOne(MaterialInventory, {
  foreignKey: "inventory_id", // Foreign key in MaterialInventory
  sourceKey: "inventory_id", // Source key in InventoryInward
});

MaterialInventory.belongsTo(InventoryInward, {
  foreignKey: "inventory_id", // Foreign key in MaterialInventory
  targetKey: "inventory_id", // Target key in InventoryInward
});
