"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Talep } from "@/types/talep"

const oncelikSeviyeleri = [
  "Düşük",
  "Normal",
  "Yüksek",
  "Kritik"
];

const birimler = [
  "Planlama Birimi",
  "Operasyon Birimi",
  "Teknik Birim",
  "Yönetim",
  "Diğer"
];

export default function TalepForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    talepEden: "",
    birim: "",
    konu: "",
    aciklama: "",
    oncelik: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.talepEden || !formData.birim || !formData.konu || !formData.aciklama || !formData.oncelik) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/talep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Talep gönderilirken bir hata oluştu.');
      }
      
      // Formu sıfırla
      setFormData({
        talepEden: "",
        birim: "",
        konu: "",
        aciklama: "",
        oncelik: "",
      });
      
      toast({
        title: "Başarılı",
        description: "Talebiniz başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error('Hata:', error);
      toast({
        title: "Hata",
        description: "Talebiniz kaydedilirken bir sorun oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Talep Eden */}
        <div className="space-y-2">
          <Label htmlFor="talepEden">Talep Eden *</Label>
          <Input
            id="talepEden"
            value={formData.talepEden}
            onChange={(e) => handleInputChange("talepEden", e.target.value)}
            placeholder="Adınız ve soyadınız"
            required
          />
        </div>

        {/* Birim */}
        <div className="space-y-2">
          <Label htmlFor="birim">Birim *</Label>
          <Select value={formData.birim} onValueChange={(value) => handleInputChange("birim", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Birim seçin" />
            </SelectTrigger>
            <SelectContent>
              {birimler.map((birim) => (
                <SelectItem key={birim} value={birim}>
                  {birim}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Konu */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="konu">Konu *</Label>
          <Input
            id="konu"
            value={formData.konu}
            onChange={(e) => handleInputChange("konu", e.target.value)}
            placeholder="Talep konusu"
            required
          />
        </div>

        {/* Öncelik */}
        <div className="space-y-2">
          <Label htmlFor="oncelik">Öncelik *</Label>
          <Select value={formData.oncelik} onValueChange={(value) => handleInputChange("oncelik", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Öncelik seçin" />
            </SelectTrigger>
            <SelectContent>
              {oncelikSeviyeleri.map((oncelik) => (
                <SelectItem key={oncelik} value={oncelik}>
                  {oncelik}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Açıklama */}
      <div className="space-y-2">
        <Label htmlFor="aciklama">Açıklama *</Label>
        <Textarea
          id="aciklama"
          value={formData.aciklama}
          onChange={(e) => handleInputChange("aciklama", e.target.value)}
          placeholder="Talebinizi detaylı açıklayın"
          rows={4}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Kaydediliyor..." : "Talebi Kaydet"}
      </Button>
    </form>
  );
}
