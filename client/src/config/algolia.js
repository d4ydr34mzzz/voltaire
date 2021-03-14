const NAME = "Voltaire";

let algoliaIndexName;

if (process.env.NODE_ENV === "production") {
  algoliaIndexName = `prod_${NAME}`;
} else if (process.env.NODE_ENV === "testing") {
  algoliaIndexName = `test_${NAME}`;
} else if (process.env.NODE_ENV === "development") {
  algoliaIndexName = `dev_${NAME}`;
}

export { algoliaIndexName };
