import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Sistemas = () => {
  return (
    <div className="flex flex-col w-svh gap-5">
      <div className="justify-between flex">
        <h1 className="font-bold text-6xl">Sistemas </h1>
      </div>
      <Tabs defaultValue="sistemas" className="w-full">
        <TabsList>
          <TabsTrigger value="sistemas">Sistemas</TabsTrigger>
          <TabsTrigger value="meuSistemas">Meus sistemas</TabsTrigger>
        </TabsList>
        <TabsContent value="sistemas">Lista dos sistemas</TabsContent>
        <TabsContent value="meuSistemas">Lista dos seus sistemas.</TabsContent>
      </Tabs>
    </div>
  );
};

export default Sistemas;
