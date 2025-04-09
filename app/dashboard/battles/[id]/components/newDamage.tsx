import { getBattleById } from "@/lib/actions/battle.actions";
import {
  getCharacterByActualUser,
  getCharactersByActualUserAndCampaign,
  getCharactersByCampaign,
} from "@/lib/actions/character.actions";
import { createDamage } from "@/lib/actions/damage.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const NewDamage = () => {
  const { id } = useParams();
  const [characters, setCharacters] = useState([]);

  const form = useForm({
    defaultValues: {
      character: "",
      damage: 0,
      isCritical: false,
      round: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      const battle = await getBattleById(id);
      if (user._id === battle.data.owner._id) {
        const allCharacter = await getCharactersByCampaign(
          battle.data.campaign._id
        );
        console.log(allCharacter);
        setCharacters(allCharacter.data);
      } else {
        const allCharacter = await getCharactersByActualUserAndCampaign(
          battle.data.campaign._id
        );
        setCharacters(allCharacter.data);
      }
    };
    fetchData();
  }, [id]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      battle: id,
    };

    const created = await createDamage(data);
  };

  return (
    <div>
      <div>{JSON.stringify(characters)}</div>
    </div>
  );
};

export default NewDamage;
