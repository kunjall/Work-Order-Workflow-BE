const { Workorder } = require("../models/wow_workorder");

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

module.exports = { create, findWorkorder };
