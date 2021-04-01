const express = require("express");
const router = express.Router();
const { Octokit } = require("@octokit/core");
const { param, validationResult } = require("express-validator");
const { ensureAuthenticated } = require("../../helpers/auth");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

/**
 * @route GET /api/github/test
 * @access public
 * @description Get request route handler for the /api/github/test path (i.e. check if the API endpoint is working)
 */
router.get("/test", (req, res) => {
  res.json({ msg: "github" });
});

/**
 * @route GET /api/github/user/:username/repos
 * @access private
 * @description Get request route handler for the /api/github/user/:username/repos path (returns the 5 most recently updated
 * repos for the specified GitHub account)
 */
router.get(
  "/user/:username/repos",
  ensureAuthenticated,
  [
    param("username")
      .trim()
      .isLength({ max: 39 })
      .withMessage(
        "GitHub username needs to be between 1 and 39 characters long"
      )
      .bail()
      .custom((value, { req }) => {
        return value.match("^[A-Za-z0-9-]+$");
      })
      .withMessage(
        "GitHub username can only contain letters, numbers, and hyphens"
      )
      .bail()
      .custom((value, { req }) => {
        if (
          value.startsWith("-") ||
          value.endsWith("-") ||
          value.includes("--")
        ) {
          return false;
        }
        return true;
      })
      .withMessage(
        "GitHub username cannot begin or end with a hyphen or have multiple consecutive hyphens"
      ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.mapped());
    }

    octokit
      .request("GET /users/{username}/repos", {
        username: req.params.username,
        sort: "updated",
        direction: "desc",
        per_page: 5,
        page: 1,
      })
      .then((response) => {
        let repos = response.data;
        res.json(repos);
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      });
  }
);

module.exports = router;
