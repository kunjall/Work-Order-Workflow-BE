const { ApprovalMatrix } = require("../models/wow_approval_matrix");

const findReviewer = async (req, res) => {
  try {
    const type = req.query.type;
    const city = req.query.city;
    const foundReviewer = await ApprovalMatrix.findAll({
      where: { type: type, city: city },
      logging: console.log,
    });
    res.json(foundReviewer);
  } catch (error) {
    console.error("Error finding Reviewers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  findReviewer,
};
