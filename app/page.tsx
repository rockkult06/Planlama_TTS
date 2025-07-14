"use client"

import { useState, useEffect } from "react"
import TalepForm from "@/components/talep-form"
import TalepTable from "@/components/talep-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Basit bir hata yakalama
    const handleError = (event: ErrorEvent) => {
      console.error('Client error:', event.error)
      setError('Bir hata oluştu. Lütfen sayfayı yenileyin.')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Hata</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    )
  }

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
