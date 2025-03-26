import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";

type Props = {
  name: string;
  key: string;
};

const CampaignCard = ({ name, key }: Props) => {
  return (
    <Card key={key}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold uppercase flex gap-2">
          {" "}
          <Book className="self-center" />
          <span>{name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad reiciendis
        earum rem! Illum veniam quibusdam optio aliquid explicabo voluptas
        commodi, id culpa odio iure impedit nisi repudiandae, totam iusto
        necessitatibus?
      </CardContent>
    </Card>
  );
};

export default CampaignCard;
