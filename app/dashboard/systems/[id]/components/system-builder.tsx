"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit, Save, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateSystemFields } from "@/lib/actions/system.actions";
import { toast } from "sonner";
import Link from "next/link";

interface IFieldDefinition {
  name: string;
  key: string;
  type: "text" | "number" | "textarea" | "boolean";
  defaultValue?: any;
  required: boolean;
  linkedAttribute?: string;
  rollType?: string;
  _id?: string;
}

interface IAbilityDefinition {
    name: string;
    key: string;
    description: string;
    rollFormula: string;
    cost: string;
    _id?: string;
}

export default function SystemBuilder({ initialData }: { initialData: any }) {
  const [system, setSystem] = useState(initialData);

  const updateSection = async (section: "attributes" | "skills" | "info" | "abilities", fields: any[]) => {
    // Optimistic update
    const updatedSystem = { ...system, [section]: fields };
    setSystem(updatedSystem);

    const res = await updateSystemFields(system._id, { [section]: fields });
    if (res.error) {
      toast.error("Falha ao salvar alterações");
    } else {
       toast.success("Salvo com sucesso");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/systems">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
           <h1 className="text-2xl font-bold">{system.name}</h1>
           <p className="text-muted-foreground text-sm">{system.description}</p>
        </div>
      </div>

      <Tabs defaultValue="attributes" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
          <TabsTrigger value="skills">Perícias</TabsTrigger>
          <TabsTrigger value="abilities">Habilidades</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attributes">
          <FieldSection 
            title="Atributos Base" 
            description="Defina os atributos principais (Ex: Força, Agilidade)"
            fields={system.attributes || []}
            section="attributes"
            onUpdate={(fields) => updateSection("attributes", fields)}
          />
        </TabsContent>
        
        <TabsContent value="skills">
          <FieldSection 
            title="Perícias" 
            description="Defina as perícias disponíveis (Ex: Furtividade, Atletismo)"
            fields={system.skills || []}
            section="skills"
            attributeList={system.attributes}
            onUpdate={(fields) => updateSection("skills", fields)}
          />
        </TabsContent>

        <TabsContent value="abilities">
          <AbilitySection 
            title="Habilidades e Poderes" 
            description="Defina habilidades especiais que possuem jogadas de dados"
            fields={system.abilities || []}
            onUpdate={(fields) => updateSection("abilities", fields)}
          />
        </TabsContent>
        
        <TabsContent value="info">
          <FieldSection 
            title="Informações do Personagem" 
            description="Campos de texto gerais (Ex: Idade, Histórico, Classe)"
            fields={system.info || []}
            section="info"
            onUpdate={(fields) => updateSection("info", fields)}
          />
        </TabsContent>

        <TabsContent value="config">
            <Card>
                <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>Gerencie módulos opcionais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Sistema de Inventário</Label>
                            <p className="text-sm text-muted-foreground">Habilitar aba de inventário na ficha</p>
                        </div>
                        <Switch 
                            checked={system.hasInventory}
                            onCheckedChange={async (val) => {
                                setSystem({...system, hasInventory: val});
                                await updateSystemFields(system._id, { hasInventory: val });
                                toast.success("Configuração atualizada");
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FieldSection({ 
    title, 
    description, 
    fields, 
    onUpdate,
    section,
    attributeList
}: { 
    title: string, 
    description: string, 
    fields: IFieldDefinition[], 
    onUpdate: (f: IFieldDefinition[]) => void,
    section: "attributes" | "skills" | "info",
    attributeList?: IFieldDefinition[]
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<IFieldDefinition | null>(null);

    const handleSaveField = (field: IFieldDefinition) => {
        let newFields;
        if (editingField) {
            newFields = fields.map(f => f.key === editingField.key ? field : f);
        } else {
            // Check for key collision
            if (fields.some(f => f.key === field.key)) {
                toast.error("Já existe um campo com esta chave/nome");
                return;
            }
            newFields = [...fields, field];
        }
        onUpdate(newFields);
        setIsDialogOpen(false);
        setEditingField(null);
    };

    const handleDelete = (key: string) => {
        onUpdate(fields.filter(f => f.key !== key));
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Button onClick={() => { setEditingField(null); setIsDialogOpen(true); }} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Adicionar Campo
                </Button>
            </CardHeader>
            <CardContent>
                {fields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg">
                        Nenhum campo definido. Adicione um para começar.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {fields.map((field) => (
                            <div key={field.key} className="flex items-center justify-between p-3 border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded text-primary font-bold text-xs uppercase w-16 text-center whitespace-nowrap overflow-hidden text-ellipsis px-1">
                                        {field.type}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{field.name}</p>
                                            {field.linkedAttribute && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">
                                                    Linked: {attributeList?.find(a => a.key === field.linkedAttribute)?.name || field.linkedAttribute}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">key: {field.key}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingField(field); setIsDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(field.key)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingField ? "Editar Campo" : "Novo Campo"}</DialogTitle>
                        <DialogDescription>Defina as propriedades do campo.</DialogDescription>
                    </DialogHeader>
                    <FieldForm 
                        initialData={editingField} 
                        onSubmit={handleSaveField}
                        onCancel={() => setIsDialogOpen(false)}
                        isSkill={section === "skills"}
                        attributeList={attributeList}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function AbilitySection({ 
    title, 
    description, 
    fields, 
    onUpdate 
}: { 
    title: string, 
    description: string, 
    fields: IAbilityDefinition[], 
    onUpdate: (f: IAbilityDefinition[]) => void 
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<IAbilityDefinition | null>(null);

    const handleSaveField = (field: IAbilityDefinition) => {
        let newFields;
        if (editingField) {
            newFields = fields.map(f => f.key === editingField.key ? field : f);
        } else {
            if (fields.some(f => f.key === field.key)) {
                toast.error("Já existe uma habilidade com esta chave/nome");
                return;
            }
            newFields = [...fields, field];
        }
        onUpdate(newFields);
        setIsDialogOpen(false);
        setEditingField(null);
    };

    const handleDelete = (key: string) => {
        onUpdate(fields.filter(f => f.key !== key));
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Button onClick={() => { setEditingField(null); setIsDialogOpen(true); }} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Adicionar Habilidade
                </Button>
            </CardHeader>
            <CardContent>
                {fields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg">
                        Nenhuma habilidade definida.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {fields.map((field) => (
                            <div key={field.key} className="flex items-center justify-between p-3 border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{field.name}</p>
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded border font-mono">
                                            {field.rollFormula || "Sem rolagem"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{field.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingField(field); setIsDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(field.key)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingField ? "Editar Habilidade" : "Nova Habilidade"}</DialogTitle>
                    </DialogHeader>
                    <AbilityForm 
                        initialData={editingField} 
                        onSubmit={handleSaveField}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function FieldForm({ initialData, onSubmit, onCancel, isSkill, attributeList }: { 
    initialData: IFieldDefinition | null, 
    onSubmit: (data: IFieldDefinition) => void,
    onCancel: () => void,
    isSkill?: boolean,
    attributeList?: IFieldDefinition[]
}) {
    const [name, setName] = useState(initialData?.name || "");
    const [key, setKey] = useState(initialData?.key || "");
    const [type, setType] = useState<any>(initialData?.type || "text");
    const [required, setRequired] = useState(initialData?.required || false);
    const [linkedAttribute, setLinkedAttribute] = useState(initialData?.linkedAttribute || "none");
    const [rollType, setRollType] = useState(initialData?.rollType || "");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setName(newVal);
        if (!initialData) {
            setKey(newVal.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalData: IFieldDefinition = {
            name,
            key,
            type,
            required,
            defaultValue: "" 
        };

        if (isSkill) {
            if (linkedAttribute !== "none") {
                finalData.linkedAttribute = linkedAttribute;
            }
            if (rollType) {
                finalData.rollType = rollType;
            }
        }

        onSubmit(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nome</Label>
                    <Input id="name" value={name} onChange={handleNameChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="key" className="text-right">Chave (ID)</Label>
                    <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} className="col-span-3 font-mono" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Tipo</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Texto Curto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="textarea">Texto Longo</SelectItem>
                            <SelectItem value="boolean">Sim/Não</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isSkill && attributeList && attributeList.length > 0 && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="linkedAttr" className="text-right">Atributo</Label>
                        <Select value={linkedAttribute} onValueChange={setLinkedAttribute}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Vincular a atributo (Opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                {attributeList.map(attr => (
                                    <SelectItem key={attr.key} value={attr.key}>{attr.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                {isSkill && linkedAttribute !== "none" && (
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rollType" className="text-right">Dado Padrão</Label>
                         <Input 
                            id="rollType" 
                            value={rollType} 
                            onChange={(e) => setRollType(e.target.value)} 
                            className="col-span-3" 
                            placeholder="Ex: d20, 3d6, etc"
                        />
                    </div>
                )}

                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="req" className="text-right">Obrigatório</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                        <Switch id="req" checked={required} onCheckedChange={setRequired} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </DialogFooter>
        </form>
    );
}

function AbilityForm({ initialData, onSubmit, onCancel }: { 
    initialData: IAbilityDefinition | null, 
    onSubmit: (data: IAbilityDefinition) => void,
    onCancel: () => void 
}) {
    const [name, setName] = useState(initialData?.name || "");
    const [key, setKey] = useState(initialData?.key || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [rollFormula, setRollFormula] = useState(initialData?.rollFormula || "");
    const [cost, setCost] = useState(initialData?.cost || "");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setName(newVal);
        if (!initialData) {
            setKey(newVal.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            key,
            description,
            rollFormula,
            cost
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="a_name" className="text-right">Nome</Label>
                    <Input id="a_name" value={name} onChange={handleNameChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="a_key" className="text-right">Chave</Label>
                    <Input id="a_key" value={key} onChange={(e) => setKey(e.target.value)} className="col-span-3 font-mono" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="a_formula" className="text-right">Rolagem</Label>
                    <Input id="a_formula" value={rollFormula} onChange={(e) => setRollFormula(e.target.value)} className="col-span-3" placeholder="Ex: 3d3 + 5" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="a_desc" className="text-right">Descrição</Label>
                     <Input id="a_desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                </div>
            </div>
             <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </DialogFooter>
        </form>
    );
}
