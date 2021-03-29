var cloudinary = require("cloudinary");
require("dotenv").config({ path: "../../.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/* References:
 * https://support.cloudinary.com/hc/en-us/articles/202521082-How-to-list-all-images-within-a-folder-
 * https://cloudinary.com/documentation/search_api#expression_examples
 */
cloudinary.v2.search
  .expression(
    "folder:showcase_images AND access_mode:public AND resource_type:image"
  )
  .sort_by("uploaded_at", "desc")
  .max_results(10)
  .execute()
  .then((result) => {
    if (result) {
      let showcaseImages = "";
      result.resources.map(
        (resource) => (showcaseImages = showcaseImages + " " + resource.url)
      );
      console.log(showcaseImages);
    }
  })
  .catch((err) => console.log(err));
