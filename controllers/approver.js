const { ApprovalMatrix } = require("../models/wow_approval_matrix");

const findReviewer = async (req, res) => {
  try {
    const { type, city, reviewer_name } = req.query;

    const whereClause = { type, city };
    if (reviewer_name) {
      whereClause.reviewer_name = reviewer_name;
    }

    const foundReviewer = await ApprovalMatrix.findAll({
      where: whereClause,
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
