const express = require("express");
const router = express.Router();
const changeRequestController = require("../controllers/changeRequest");
const changeRequestMwoController = require("../controllers/changeRequestMwo");
const authMiddleware = require("../middleware/authMiddleware");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CWO Change Request routes
// Create a new change request
router.post("/create", changeRequestController.createChangeRequest);

// Get change requests with optional filters
router.get("/find", changeRequestController.getChangeRequests);

// Get materials for a specific change request
router.get(
  "/materials/:cr_id",
  changeRequestController.getChangeRequestMaterials
);

// Get services for a specific change request
router.get(
  "/services/:cr_id",
  changeRequestController.getChangeRequestServices
);

// Update change request status
router.put(
  "/update-status/:cr_id",
  changeRequestController.updateChangeRequestStatus
);

// MWO Change Request routes
// Create a new MWO change request
router.post("/mwo/create", changeRequestMwoController.createMwoChangeRequest);

// Get MWO change requests with optional filters
router.get("/mwo/find", changeRequestMwoController.getMwoChangeRequests);

// Get materials for a specific MWO change request
router.get(
  "/mwo/materials/:cr_id",
  changeRequestMwoController.getMwoChangeRequestMaterials
);

// Get services for a specific MWO change request
router.get(
  "/mwo/services/:cr_id",
  changeRequestMwoController.getMwoChangeRequestServices
);

// Update MWO change request status
router.put(
  "/mwo/update-status/:cr_id",
  changeRequestMwoController.updateMwoChangeRequestStatus
);

module.exports = router;
