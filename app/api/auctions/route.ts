import { type NextRequest, NextResponse } from "next/server"
import { withAuth, withRateLimit } from "@/middleware/auth"
import type { AuctionFormData, ApiResponse } from "@/types/auction-types"
import { randomUUID } from "crypto"
import { supabase } from "@/lib/supabaseClient"
import { keysToLowerCase } from "@/utils/misc"

// GET /api/auctions
export async function getAllTheAuctions() {
  const { data, error } = await supabase
    .from('auctions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

// POST /api/auctions
export async function createASingleAuction(req: Request) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('auctions')
    .insert([body])
    .select()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data: data[0] }, { status: 201 })
}

/**
 * GET /api/auctions - Get all auctions (with filtering)
 */
async function getAuctions(req: NextRequest, user: any): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const auctionType = searchParams.get("auctionType")

    // Mock auction data - in production, this would query your database
    // const mockAuctions = [
    //   {
    //     id: "auction-1",
    //     title: "Vintage Rolex Watch",
    //     description: "Rare vintage Rolex Submariner in excellent condition",
    //     categoryId: "jewelry-watches-luxury",
    //     auctionType: "forward",
    //     auctionSubType: "english",
    //     startPrice: 5000,
    //     currentBid: 7500,
    //     status: "active",
    //     endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    //     createdBy: user.id,
    //     participationType: "public",
    //     isSilentAuction: false,
    //   },
    //   {
    //     id: "auction-2",
    //     title: "MacBook Pro 16-inch",
    //     description: "Latest MacBook Pro with M3 chip",
    //     categoryId: "electronics-laptops",
    //     auctionType: "reverse",
    //     auctionSubType: "sealed-bid",
    //     startPrice: 2500,
    //     currentBid: 2200,
    //     status: "active",
    //     endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    //     createdBy: user.id,
    //     participationType: "verified",
    //     isSilentAuction: false,
    //   },
    // ]

    const { data, error } = await supabase
    .from('auctions')
    .select('*')
    .order('createdat', { ascending: false })
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    const mockAuctions = data || []
    // Apply filters
    let filteredAuctions = mockAuctions
    
    if (category) {
      filteredAuctions = filteredAuctions.filter((auction) => auction.categoryId === category)
    }

    if (status) {
      filteredAuctions = filteredAuctions.filter((auction) => auction.status === status)
    }

    if (auctionType) {
      filteredAuctions = filteredAuctions.filter((auction) => auction.auctionType === auctionType)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAuctions = filteredAuctions.slice(startIndex, endIndex)

    const response: ApiResponse = {
      success: true,
      data: {
        auctions: paginatedAuctions,
        pagination: {
          page,
          limit,
          total: filteredAuctions.length,
          totalPages: Math.ceil(filteredAuctions.length / limit),
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching auctions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch auctions" }, { status: 500 })
  }
}

/**
 * POST /api/auctions - Create a new auction
 */
async function createAuction(req: NextRequest, user: any): Promise<NextResponse> {
  try {
    const auctionData: AuctionFormData = await req.json()
    const { searchParams } = new URL(req.url)
    const createdBy = searchParams.get("user")
    // Validate required fields
    if (!auctionData.auctionType || !auctionData.auctionSubType) {
      return NextResponse.json({ success: false, error: "Auction type and subtype are required" }, { status: 400 })
    }

    if (!auctionData.productName && !auctionData.isMultiLot) {
      return NextResponse.json(
        { success: false, error: "Product name is required for single lot auctions" },
        { status: 400 },
      )
    }

    if (auctionData.isMultiLot && auctionData.lots.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one lot is required for multi-lot auctions" },
        { status: 400 },
      )
    }

    // Validate bid increment rules
    if (auctionData.bidIncrementType === "range-based" && auctionData.bidIncrementRules.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one bid increment rule is required for range-based auctions" },
        { status: 400 },
      )
    }

    // Generate auction ID
    // const auctionId = `auction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const auctionId = randomUUID()
    
    // Mock auction creation - in production, this would save to your database
    const newAuction = keysToLowerCase({
      id: auctionId,
      ...auctionData,
      createdAt: new Date().toISOString(),
      status: auctionData.launchType === "immediate" ? "active" : "scheduled",
      currentBid: auctionData.startPrice,
      bidCount: 0,
      participants: [],
    })

    // In production, you would:
    // 1. Save auction to database
    const { data, error } = await supabase
      .from('auctions')
      .insert([newAuction])
      .select()
    if (error){
      
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    // 2. Upload files to S3
    // 3. Send notifications if needed
    // 4. Schedule auction start if it's a scheduled auction
    
    const response: ApiResponse = {
      success: true,
      data: { auction: newAuction },
      message: "Auction created successfully",
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating auction:", error)
    return NextResponse.json({ success: false, error: "Failed to create auction" }, { status: 500 })
  }
}

// Apply authentication and rate limiting to the handlers
const authenticatedGetAuctions = withAuth(getAuctions, "view_public_auctions")
const authenticatedCreateAuction = withAuth(createAuction, "create_auction")

// export const GET = withRateLimit(authenticatedGetAuctions)
// export const POST = withRateLimit(authenticatedCreateAuction)

export const GET = getAuctions
export const POST = createAuction