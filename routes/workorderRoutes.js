const express = require("express");
const router = express.Router();
const workorderController = require("../controllers/workorders.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.post(
  "/workorder/create",
  authenticateUser,
  workorderController.createMotherWorkorder
);
router.get(
  "/workorder/find-workorder",
  authenticateUser,
  workorderController.findWorkorder
);

router.get(
  "/workorder/find-workorder-actions",
  authenticateUser,
  workorderController.getMwoActions
);

router.get(
  "/workorder/find-child-workorder-actions",
  authenticateUser,
  workorderController.getCwoActions
);

// router.get(
//   "/workorder/find-material-mwo-id",
//   authenticateUser,
//   workorderController.getMwoMaterialActions
// );

// router.get(
//   "/workorder/find-service-mwo-id",
//   authenticateUser,
//   workorderController.getMwoServiceActions
// );

router.get(
  "/workorder/find-child-workorder",
  authenticateUser,
  workorderController.findChildWorkorder
);

router.get(
  "/workorder/find-invoice-cwo",
  authenticateUser,
  workorderController.invoiceCwo
);

router.get(
  "/workorder/find-child-services",
  authenticateUser,
  workorderController.findChildServices
);

router.get(
  "/workorder/find-child-material",
  authenticateUser,
  workorderController.findChildMaterials
);

router.get(
  "/workorder/find-mother-services",
  authenticateUser,
  workorderController.findMotherServices
);

router.get(
  "/workorder/find-mother-material",
  authenticateUser,
  workorderController.findMotherMaterials
);

router.get(
  "/workorder/find-all-mother-material",
  authenticateUser,
  workorderController.getAllMwoMaterial
);

router.get(
  "/workorder/find-all-mother-service",
  authenticateUser,
  workorderController.getAllMwoService
);

router.get(
  "/workorder/find-all-child-material",
  authenticateUser,
  workorderController.getAllCwoMaterial
);

router.get(
  "/workorder/find-all-child-service",
  authenticateUser,
  workorderController.getAllCwoService
);

router.post(
  "/workorder/createChild",
  authenticateUser,
  workorderController.createChildWorkorder
);

router.patch(
  "/workorder/update-status",
  authenticateUser,
  workorderController.updateMwoStatusDetails
);

router.patch(
  "/workorder/update-cwo-approve-status",
  authenticateUser,
  workorderController.updateCwoApproveDetails
);

router.patch(
  "/workorder/reject-cwo",
  authenticateUser,
  workorderController.rejectCwo
);

module.exports = router;
