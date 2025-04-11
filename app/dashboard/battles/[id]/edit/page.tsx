"use client";

import { useParams } from "next/navigation";

const EditBattle = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Edit Battle</h1>
      <p>This is the edit battle page.</p>
      <p>Here you can edit the battle details.</p>
      <p>Make sure to save your changes!</p>
    </div>
  );
};

export default EditBattle;
