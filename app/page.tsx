"use client"

import TalepForm from "@/components/talep-form"
import TalepTable from "@/components/talep-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Talep Takip Sistemi</h1>

      <Tabs defaultValue="form">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="form">Yeni Talep Oluştur</TabsTrigger>
          <TabsTrigger value="list">Taleplerim</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Talep</CardTitle>
              <CardDescription>
                Yeni bir talep oluşturmak için aşağıdaki formu doldurun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TalepForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <TalepTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
