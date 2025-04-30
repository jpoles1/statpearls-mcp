import { handleStatPearlsRequest } from "./tools/statpearls";

handleStatPearlsRequest({query: "adult still's disease"})
  .then((result) => {
    console.log("StatPearls Result:", result);
  }
  )
  .catch((error) => {
    console.error("Error:", error);
  }
  );