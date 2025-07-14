"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define the Auction interface based on the reference
interface AuctionDuration {
  days?: number;
  hours?: number;
  minutes?: number;
}

interface Attribute {
  id?: string;
  name?: string;
  type?: string;
  value?: string | number;
  required?: boolean;
}

interface Auction {
  id: string;
  productname?: string;
  title?: string;
  categoryid?: string;
  auctiontype: "forward" | "reverse";
  currentbid?: number;
  bidincrementtype?: "fixed" | "percentage";
  minimumincrement?: number;
  startprice?: number;
  scheduledstart?: string | null;
  auctionduration?: AuctionDuration;
  bidders?: number;
  watchers?: number;
  productimages?: string[];
  productdocuments?: string[];
  productdescription?: string;
  specifications?: string; // JSON string or null
  buyNowPrice?: number;
  participants?: string[];
  bidcount?: number;
  createdby?: string;
  questions?: { user: string; question: string; answer: string | null; question_time: string | null; answer_time: string | null }[];
  question_count?: number;
  issilentauction?: boolean;
  currentbidder?: string;
  percent?: number;
  attributes?: string; // JSON string or null
  sku?: string;
  brand?: string;
  model?: string;
  reserveprice?: number;
  auctionsubtype?: string;
  targetprice?: number; // Added for reverse auctions
}

// Function to render key-value blocks from JSON data
function renderKeyValueBlock(
  data: string | Record<string, any> | undefined,
  fallback: string
): React.ReactNode {
  try {
    const parsed: Attribute[] =
      typeof data === "string" ? JSON.parse(data) : data ?? [];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return (
        <span className="text-gray-600 dark:text-gray-300 ml-4">
          {fallback}
        </span>
      );
    }

    return (
      <>
        {parsed.map((attr, index) =>
          attr.value ? (
            <div key={index} className="text-gray-600 dark:text-gray-300 ml-4 flex items-center gap-2">
              <span className="font-medium">{attr.name}:</span>
              {attr.type === "color" ? (
                <span
                  className="inline-block w-4 h-4 rounded-sm border ml-1"
                  style={{ backgroundColor: attr.value as string }}
                  title={attr.value as string}
                ></span>
              ) : (
                attr.value
              )}
            </div>
          ) : null
        )}
      </>
    );
  } catch {
    return (
      <span className="text-gray-600 dark:text-gray-300 ml-4">
        Invalid attributes data
      </span>
    );
  }
}

export default function EditAuctionPage() {
  const params = useParams<{ id: string }>();
  const auctionId = params.id;
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState<Auction>({
    id: "",
    productname: "",
    title: "",
    categoryid: "",
    auctiontype: "forward",
    currentbid: 0,
    bidincrementtype: "fixed",
    minimumincrement: 0,
    startprice: 0,
    scheduledstart: null,
    auctionduration: { days: 0, hours: 0, minutes: 0 },
    bidders: 0,
    watchers: 0,
    productimages: [],
    productdocuments: [],
    productdescription: "",
    specifications: "",
    buyNowPrice: 0,
    participants: [],
    bidcount: 0,
    createdby: "",
    questions: [],
    question_count: 0,
    issilentauction: false,
    currentbidder: "",
    percent: 0,
    attributes: "",
    sku: "",
    brand: "",
    model: "",
    reserveprice: 0,
    auctionsubtype: "",
    targetprice: 0,
  });

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listings/${auctionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to fetch auction");
        setAuction(data.data);
        setFormData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctionDetails();
  }, [auctionId]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (formData.productimages?.length ?? 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (formData.productimages?.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDurationChange = (field: keyof AuctionDuration, value: string) => {
    setFormData((prev) => ({
      ...prev,
      auctionduration: { ...prev.auctionduration, [field]: parseInt(value) || 0 },
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/listings/${auctionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update auction");
      alert("Auction updated successfully!");
      router.push(`/seller-panel/my-listings/${auctionId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred while saving");
    }
  };

  if (loading) return <div className="text-center py-20 text-lg text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="text-center py-20 text-lg text-red-600 dark:text-red-400">{error}</div>;
  if (!auction) return <div className="text-center py-20 text-lg text-gray-600 dark:text-gray-300">Auction not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-corporate-700 via-corporate-600 to-corporate-500 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <img
                  src="/briskon-auction-horizontal-logo-white.png"
                  alt="Briskon Auction Logo"
                  className="h-12 w-auto object-contain transition-transform hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-logo.png";
                  }}
                />
              </div>
              <div className="text-white font-semibold text-2xl tracking-wide">
                Auction Wizard
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/seller-panel/my-listings/${auctionId}`)}
                className="flex items-center text-base font-semibold text-white border-corporate-300 dark:border-gray-600 bg-corporate-700/20 hover:bg-corporate-800/40 dark:hover:bg-gray-700/40 rounded-lg px-4 py-2 transition-all duration-300 hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Listing
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                className="flex items-center text-base font-semibold bg-corporate-600 hover:bg-corporate-700 dark:bg-corporate-500 dark:hover:bg-corporate-600 text-white rounded-lg px-4 py-2 transition-all duration-300 hover:shadow-md"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0 relative">
                <Image
                  src={formData.productimages?.[currentImageIndex] || "/placeholder.svg"}
                  alt={formData.productname || formData.title || "Auction Item"}
                  width={800}
                  height={500}
                  className="w-full h-[450px] object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full shadow-md">
                  {`${currentImageIndex + 1}/${formData.productimages?.length ?? 1}`}
                </div>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white/90 transition-all duration-300"
                >
                  ←
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white/90 transition-all duration-300"
                >
                  →
                </button>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {formData.productimages?.map((image, index) => (
                      <Image
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`${formData.productname || formData.title} ${index + 1}`}
                        width={120}
                        height={90}
                        className="w-24 h-18 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-corporate-500 transition-all duration-300 hover:shadow-md"
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  Edit {formData.productname || formData.title || "Untitled Auction"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Editable Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name <span className="text-red-500">(Editable)</span></label>
                        <Input
                          name="productname"
                          value={formData.productname || ""}
                          onChange={handleInputChange}
                          className="mt-1 w-full"
                        />
                      </div>
                      {formData.auctiontype === "forward" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Price ($) <span className="text-red-500">(Editable)</span></label>
                          <Input
                            name="startprice"
                            type="number"
                            value={formData.startprice || ""}
                            onChange={handleInputChange}
                            className="mt-1 w-full"
                          />
                        </div>
                      )}
                      {formData.auctiontype === "reverse" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Price ($) <span className="text-red-500">(Editable)</span></label>
                          <Input
                            name="targetprice"
                            type="number"
                            value={formData.targetprice || ""}
                            onChange={handleInputChange}
                            className="mt-1 w-full"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Increment ($) <span className="text-red-500">(Editable)</span></label>
                        <Input
                          name="minimumincrement"
                          type="number"
                          value={formData.minimumincrement || ""}
                          onChange={handleInputChange}
                          className="mt-1 w-full"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auction Duration <span className="text-red-500">(Editable)</span></label>
                        <div className="grid grid-cols-3 gap-4 mt-1">
                          <Input
                            name="days"
                            type="number"
                            value={formData.auctionduration?.days || ""}
                            onChange={(e) => handleDurationChange("days", e.target.value)}
                            className="w-full"
                            placeholder="Days"
                          />
                          <Input
                            name="hours"
                            type="number"
                            value={formData.auctionduration?.hours || ""}
                            onChange={(e) => handleDurationChange("hours", e.target.value)}
                            className="w-full"
                            placeholder="Hours"
                          />
                          <Input
                            name="minutes"
                            type="number"
                            value={formData.auctionduration?.minutes || ""}
                            onChange={(e) => handleDurationChange("minutes", e.target.value)}
                            className="w-full"
                            placeholder="Minutes"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Description <span className="text-red-500">(Editable)</span></label>
                        <Textarea
                          name="productdescription"
                          value={formData.productdescription || ""}
                          onChange={handleInputChange}
                          className="mt-1 w-full h-32"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Auction Details (Read-Only)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "ID", value: formData.id },
                  { label: "Title", value: formData.title || "N/A" },
                  { label: "Category ID", value: formData.categoryid || "Uncategorized" },
                  { label: "Auction Type", value: formData.auctiontype === "forward" ? "Forward" : "Reverse" },
                  { label: "Auction Subtype", value: formData.auctionsubtype || "N/A" },
                  { label: "Buy Now Price", value: formData.buyNowPrice ? `$${formData.buyNowPrice.toLocaleString()}` : "N/A" },
                  { label: "Reserve Price", value: formData.reserveprice ? `$${formData.reserveprice.toLocaleString()}` : "N/A" },
                  { label: "Scheduled Start", value: formData.scheduledstart ? new Date(formData.scheduledstart).toLocaleString() : "N/A" },
                  { label: "Current Bid", value: `$${((formData.currentbid ?? 0) || "N/A").toLocaleString()}` },
                  { label: "Bid Increment Type", value: formData.bidincrementtype || "N/A" },
                  { label: "Bidders", value: formData.bidders || 0 },
                  { label: "Watchers", value: formData.watchers || 0 },
                  { label: "Participants", value: formData.participants?.length || 0 },
                  { label: "Bid Count", value: formData.bidcount || 0 },
                  { label: "Created By", value: formData.createdby || "Unknown" },
                  { label: "Current Bidder", value: formData.currentbidder || "N/A" },
                  { label: "Percent", value: formData.percent ? `${formData.percent}%` : "N/A" },
                  { label: "Questions Count", value: formData.question_count || 0 },
                  { label: "Silent Auction", value: formData.issilentauction ? "Yes" : "No" },
                  { label: "Specifications", value: renderKeyValueBlock(formData.specifications, "No specifications data") },
                  { label: "Attributes", value: renderKeyValueBlock(formData.attributes, "No attributes data") },
                  { label: "SKU", value: formData.sku || "N/A" },
                  { label: "Brand", value: formData.brand || "N/A" },
                  { label: "Model", value: formData.model || "N/A" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
