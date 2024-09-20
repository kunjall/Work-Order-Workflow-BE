const { Workorder } = require("../models/wow_workorder");
const { MaterialRecord } = require("../models/wow_material_record");
const { ServiceRecord } = require("../models/wow_service_record");

const create = async (req, res) => {
  try {
    const {
      workorder_type,
      workorder_number,
      workorder_status,
      gis_code,
      route_name,
      route_length,
      homepass_count,
      activity,
      type,
      customer_id,
      execution_city,
      customer_project_manager,
      internal_project_manager,
      customer_name,
      customer_state,
      customer_approval_date,
      created_by,
      created_at,
      total_service_cost,
      vendor_name,
    } = req.body;

    if (
      !workorder_type ||
      !workorder_number ||
      !workorder_status ||
      !gis_code ||
      !route_name ||
      !route_length ||
      !homepass_count ||
      !activity ||
      !type ||
      !customer_id ||
      !customer_project_manager ||
      !internal_project_manager ||
      !customer_name ||
      !customer_state ||
      !execution_city ||
      !customer_approval_date
    ) {
      console.log("yes");
      return res.status(400).json({ message: "All fields are required" });
    }
    const newWorkorder = await Workorder.create({
      workorder_type,
      workorder_number,
      workorder_status,
      gis_code,
      route_name,
      route_length,
      homepass_count,
      activity,
      type,
      customer_id,
      execution_city,
      customer_project_manager,
      internal_project_manager,
      customer_name,
      customer_state,
      customer_approval_date,
      created_by,
      created_at,
      total_service_cost,
      vendor_name,
    });
    res.status(201).json({
      message: "Work order created successfully",
      data: newWorkorder,
    });
  } catch (error) {
    console.error("Error creating work order:", error);
    res
      .status(500)
      .json({ message: "Failed to create work order", error: error.message });
  }
};

const findWorkorder = async (req, res) => {
  try {
    const foundWorkorder = await Workorder.findAll();
    console.log(foundWorkorder);
    res.json(foundWorkorder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const enterMaterial = async (req, res) => {
  const {
    record_id,
    workorder_id,
    material_id,
    material_desc,
    material_uom,
    material_wo_qty,
  } = req.body;

  try {
    // Create a new material record
    await MaterialRecord.create({
      record_id,
      workorder_id,
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

const enterServices = async (req, res) => {
  const {
    record_id,
    workorder_id,
    service_id,
    service_desc,
    service_uom,
    service_wo_qty,
    service_price,
  } = req.body;

  try {
    // Create a new material record
    await ServiceRecord.create({
      record_id,
      workorder_id,
      service_id,
      service_desc,
      service_uom,
      service_wo_qty,
      service_price,
    });

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { create, findWorkorder, enterMaterial, enterServices };
