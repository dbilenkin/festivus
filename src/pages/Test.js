import React, { useEffect, useState } from "react";

import { db } from "../utils/Firebase";
import { onValue, ref } from "firebase/database";

function Test() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const query = ref(db, "projects");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();

      if (snapshot.exists()) {
        Object.values(data).map((project) => {
          setProjects((projects) => [...projects, project]);
        });
      }
    });
  }, []);

  return (
    <div className="">
      {projects.map((project, index) => (
        <div key={index} >{project.name}</div>
      ))}
    </div>
  );
}

export default Test;