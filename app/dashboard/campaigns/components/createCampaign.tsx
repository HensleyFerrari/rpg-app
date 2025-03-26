"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { FormEvent } from "react";
import { createCampaign } from "@/lib/actions/campaign.actions";

const CreateCampaign = () => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const campaign = await createCampaign({ name });
    if (campaign.ok) {
      return console.log("Created!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Criar campanha</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crie sua campanha</DialogTitle>
          <DialogDescription>
            Aqui é onde você consegue criar a sua campanha!
          </DialogDescription>
        </DialogHeader>
        <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Nome da campanha
            </Label>
            <Input id="name" name="name" />
          </div>
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">copiar</span>
            <Copy />
          </Button>
        </form>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Criar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaign;
