"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { updateCampaign } from "@/lib/actions/campaign.actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampaignDocument } from "@/models/Campaign";

type FormData = {
  name: string;
  description: string;
  imageUrl: string;
  isAcepptingCharacters: boolean;
};

interface Attribute {
  name: string;
  _id?: string;
}

interface Skill {
  name: string;
  attribute: string;
  _id?: string;
}

const EditCampaignForm = ({ campaign }: { campaign: CampaignDocument }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState(campaign.description || "");

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [newAttributeName, setNewAttributeName] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedAttributeForSkill, setSelectedAttributeForSkill] =
    useState("");

  useEffect(() => {
    if (campaign.attributes) {
      setAttributes(
        campaign.attributes.map((attr, index) => ({
          ...attr,
          _id: `attr-${index}-${Date.now()}`,
        }))
      );
    }
    if (campaign.skills) {
      setSkills(
        campaign.skills.map((skill, index) => ({
          ...skill,
          _id: `skill-${index}-${Date.now()}`,
        }))
      );
    }
  }, [campaign]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: campaign.name || "",
      description: campaign.description || "",
      imageUrl: campaign.imageUrl || "",
      isAcepptingCharacters:
        campaign.isAcceptingCharacters !== undefined
          ? Boolean(campaign.isAcceptingCharacters)
          : true,
    },
  });

  const handleAddAttribute = () => {
    if (newAttributeName.trim() === "") {
      toast.error("Erro", {
        description: "O nome do atributo não pode ser vazio.",
      });
      return;
    }
    if (
      attributes.find(
        (attr) =>
          attr.name.toLowerCase() === newAttributeName.trim().toLowerCase()
      )
    ) {
      toast.error("Erro", { description: "Este atributo já existe." });
      return;
    }
    setAttributes([
      ...attributes,
      { name: newAttributeName.trim(), _id: `attr-new-${Date.now()}` },
    ]);
    setNewAttributeName("");
  };

  const handleRemoveAttribute = (attributeNameToRemove: string) => {
    setAttributes(
      attributes.filter((attr) => attr.name !== attributeNameToRemove)
    );
    setSkills(
      skills.filter((skill) => skill.attribute !== attributeNameToRemove)
    );
  };

  const handleAddSkill = () => {
    if (newSkillName.trim() === "") {
      toast.error("Erro", {
        description: "O nome da perícia não pode ser vazio.",
      });
      return;
    }
    if (!selectedAttributeForSkill) {
      toast.error("Erro", {
        description: "Selecione um atributo para a perícia.",
      });
      return;
    }
    if (
      skills.find(
        (skill) =>
          skill.name.toLowerCase() === newSkillName.trim().toLowerCase()
      )
    ) {
      toast.error("Erro", { description: "Esta perícia já existe." });
      return;
    }
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        attribute: selectedAttributeForSkill,
        _id: `skill-new-${Date.now()}`,
      },
    ]);
    setNewSkillName("");
    setSelectedAttributeForSkill("");
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    setSkills(skills.filter((skill) => skill.name !== skillNameToRemove));
  };

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.email) {
      toast.error("Erro", {
        description: "Você precisa estar logado para editar uma campanha",
      });
      return;
    }

    if (
      typeof campaign.owner === "object" &&
      "email" in campaign.owner &&
      (campaign.owner as any).email !== session.user.email
    ) {
      toast.error("Erro", {
        description: "Você não tem permissão para editar esta campanha",
      });
      return;
    }

    try {
      setIsLoading(true);
      const finalAttributes = attributes.map(({ name }) => ({ name }));
      const finalSkills = skills.map(({ name, attribute }) => ({
        name,
        attribute,
      }));

      const result = await updateCampaign(campaign._id, {
        name: data.name,
        description: description,
        imageUrl: data.imageUrl,
        isAcepptingCharacters: Boolean(data.isAcepptingCharacters),
        attributes: finalAttributes,
        skills: finalSkills,
      });

      if (result.ok) {
        toast.success("Sucesso!", {
          description: "Campanha atualizada com sucesso",
        });
        router.push(`/dashboard/campaigns/${campaign._id}`);
      } else {
        toast.error("Erro", {
          description:
            result.message || "Ocorreu um erro ao atualizar a campanha",
        });
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Erro", {
        description: "Ocorreu um erro ao atualizar a campanha",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Campanha</CardTitle>
        <CardDescription>
          Atualize os detalhes da sua campanha de RPG, atributos e perícias.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Campanha *</Label>
            <Input
              id="name"
              placeholder="Ex: A Masmorra do Dragão Negro"
              {...register("name", {
                required: "O nome da campanha é obrigatório",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Descreva sua campanha..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <Input
              id="imageUrl"
              placeholder="https://exemplo.com/imagem.jpg"
              {...register("imageUrl")}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="text-lg font-semibold">Atributos</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  id="newAttribute"
                  placeholder="Ex: Força"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAttribute();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddAttribute}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Atributo
              </Button>
            </div>
            {attributes.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                {attributes.map((attr) => (
                  <li
                    key={attr._id || attr.name}
                    className="flex items-center justify-between p-2 border rounded-md bg-secondary"
                  >
                    <span className="font-medium">{attr.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttribute(attr.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {attributes.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Nenhum atributo adicionado.
              </p>
            )}
          </div>

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="text-lg font-semibold">Perícias</h3>
            {attributes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Adicione atributos antes de criar perícias.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newSkillName">Nome da Perícia</Label>
                      <Input
                        id="newSkillName"
                        placeholder="Ex: Atletismo"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skillAttribute">Atributo Base</Label>
                      <Select
                        value={selectedAttributeForSkill}
                        onValueChange={setSelectedAttributeForSkill}
                      >
                        <SelectTrigger id="skillAttribute">
                          <SelectValue placeholder="Selecione Atributo" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes.map((attr) => (
                            <SelectItem
                              key={attr._id || attr.name}
                              value={attr.name}
                            >
                              {attr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="w-full sm:w-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Perícia
                  </Button>
                </div>
                {skills.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                    {skills.map((skill) => (
                      <li
                        key={skill._id || skill.name}
                        className="flex items-center justify-between p-2 border rounded-md bg-secondary"
                      >
                        <span className="font-medium">
                          {skill.name} ({skill.attribute})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSkill(skill.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Nenhuma perícia adicionada.
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditCampaignForm;
