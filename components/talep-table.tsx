"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCcw, Upload, Download } from "lucide-react"
import type { Talep } from "@/types/talep"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import * as XLSX from "xlsx"
import { useToast } from "@/components/ui/use-toast"

type SortField = keyof Talep
type SortDirection = "asc" | "desc"

export default function TalepTable() {
  const { toast } = useToast()
  const [talepler, setTalepler] = useState<Talep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [filters, setFilters] = useState({
    talepEden: "",
    birim: "",
    durum: "",
    search: "",
  })

  const fetchTalepler = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/talep')
      
      if (!response.ok) {
        throw new Error('Talepler getirilemedi')
      }
      
      const data = await response.json()
      setTalepler(data)
      setError(null)
    } catch (err) {
      console.error('Hata:', err)
      setError('Talepler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTalepler()
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // Excel verilerini API'ye gönder
          const importPromises = jsonData.map(async (row: any) => {
            const talepData = {
              talepEden: row["Talep Eden"] || row["Talep Sahibi"] || "",
              birim: row["Birim"] || row["Talep Sahibi Açıklaması"] || "Diğer",
              konu: row["Konu"] || row["Talep Özeti"] || "",
              aciklama: row["Açıklama"] || row["Yapılan İş"] || "",
              oncelik: row["Öncelik"] || "Normal",
              durum: row["Durum"] || "Bekliyor"
            }

            // Veritabanına kaydet
            const response = await fetch('/api/talep', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(talepData),
            })

            if (!response.ok) {
              throw new Error(`Talep kaydedilemedi: ${talepData.konu}`)
            }

            return response.json()
          })

          await Promise.all(importPromises)
          
          // Talepleri yeniden yükle
          await fetchTalepler()
          
          toast({
            title: "Başarılı",
            description: `${jsonData.length} talep başarıyla içe aktarıldı.`,
          })
          
        } catch (error) {
          console.error('Excel import hatası:', error)
          toast({
            title: "Hata",
            description: "Excel dosyası işlenirken bir hata oluştu.",
            variant: "destructive"
          })
        } finally {
          setImporting(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Dosya okuma hatası:', error)
      toast({
        title: "Hata",
        description: "Dosya okunamadı.",
        variant: "destructive"
      })
      setImporting(false)
    }
    
    // Input'u temizle
    event.target.value = ""
  }

  const handleExcelExport = () => {
    const exportData = filteredAndSortedTalepler.map((talep) => ({
      "ID": talep.id,
      "Talep Eden": talep.talepEden,
      "Birim": talep.birim,
      "Konu": talep.konu,
      "Açıklama": talep.aciklama,
      "Öncelik": talep.oncelik,
      "Durum": talep.durum,
      "Oluşturulma Tarihi": format(new Date(talep.createdAt), "dd/MM/yyyy HH:mm", { locale: tr }),
      "Güncelleme Tarihi": format(new Date(talep.updatedAt), "dd/MM/yyyy HH:mm", { locale: tr })
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Talepler")
    XLSX.writeFile(wb, `talepler_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const filteredAndSortedTalepler = talepler
    .filter((talep) => {
      return (
        (!filters.talepEden || talep.talepEden.toLowerCase().includes(filters.talepEden.toLowerCase())) &&
        (!filters.birim || talep.birim === filters.birim) &&
        (!filters.durum || talep.durum === filters.durum) &&
        (!filters.search ||
          talep.konu.toLowerCase().includes(filters.search.toLowerCase()) ||
          talep.aciklama.toLowerCase().includes(filters.search.toLowerCase()))
      )
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const getDurumBadgeVariant = (durum: string) => {
    switch (durum) {
      case "Tamamlandı":
        return "default"
      case "Reddedildi":
        return "destructive"
      case "Bekliyor":
        return "secondary"
      case "İnceleniyor":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatDate = (date: Date) => {
    return format(date, "dd MMMM yyyy, HH:mm", { locale: tr })
  }

  const uniqueBirimler = [...new Set(talepler.map(t => t.birim))]
  const uniqueDurumlar = [...new Set(talepler.map(t => t.durum))]

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Excel İşlemleri */}
      <Card>
        <CardHeader>
          <CardTitle>Excel İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleExcelExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Excel'e Aktar
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="excel-import" className="cursor-pointer">
                <Button className="flex items-center gap-2" disabled={importing}>
                  <Upload className="w-4 h-4" />
                  {importing ? "İçe Aktarılıyor..." : "Excel'den Yükle"}
                </Button>
              </Label>
              <Input
                id="excel-import"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelImport}
                className="hidden"
                disabled={importing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yenile ve Filtreler */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Talepler</CardTitle>
          <Button variant="outline" onClick={fetchTalepler} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Genel Arama</Label>
              <Input
                placeholder="Konu, açıklama..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Talep Eden</Label>
              <Input
                placeholder="İsim ara..."
                value={filters.talepEden}
                onChange={(e) => setFilters((prev) => ({ ...prev, talepEden: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Birim</Label>
              <Select
                value={filters.birim}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, birim: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {uniqueBirimler.map((birim) => (
                    <SelectItem key={birim} value={birim}>
                      {birim}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={filters.durum}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, durum: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {uniqueDurumlar.map((durum) => (
                    <SelectItem key={durum} value={durum}>
                      {durum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talepler Tablosu */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Talepler yükleniyor...</p>
            </div>
          ) : filteredAndSortedTalepler.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Hiç talep bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("talepEden")}
                    >
                      Talep Eden {sortField === "talepEden" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Birim</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("konu")}
                    >
                      Konu {sortField === "konu" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Öncelik</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Tarih {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTalepler.map((talep) => (
                    <TableRow key={talep.id}>
                      <TableCell className="font-medium">{talep.id}</TableCell>
                      <TableCell>{talep.talepEden}</TableCell>
                      <TableCell>{talep.birim}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{talep.konu}</TableCell>
                      <TableCell>{talep.oncelik}</TableCell>
                      <TableCell>
                        <Badge variant={getDurumBadgeVariant(talep.durum)}>
                          {talep.durum}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(talep.createdAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
