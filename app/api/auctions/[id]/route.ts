import { type NextRequest, NextResponse } from "next/server";
import { withAuth, withRateLimit } from "@/middleware/auth";
import type { AuctionFormData, ApiResponse } from "@/types/auction-types";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabaseClient";
import { keysToLowerCase } from "@/utils/misc";


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auctionId = params.id;

  if (!auctionId) {
    return NextResponse.json({ success: false, error: "Auction ID is required" }, { status: 400 });
  }

  // Fetch the auction
  const { data: auctionData, error: fetchError } = await supabase
    .from("auctions")
    .select("id, approved, launchtype, scheduledstart")
    .eq("id", auctionId)
    .single();

  if (fetchError || !auctionData) {
    return NextResponse.json({ success: false, error: fetchError?.message || "Auction not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  let updatedFields: any = { approved: true };

  const launchType = auctionData.launchtype;
  const currentScheduledStart = auctionData.scheduledstart;

  if (launchType === "immediate") {
    updatedFields.scheduledstart = now;
  } else if (launchType === "scheduled") {
    const scheduledDate = new Date(currentScheduledStart);
    const nowDate = new Date();

    if (isNaN(scheduledDate.getTime()) || scheduledDate <= nowDate) {
      updatedFields.scheduledstart = now;
    }
  }

  const { error: updateError } = await supabase
    .from("auctions")
    .update(updatedFields)
    .eq("id", auctionId);

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Auction approved successfully" });
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auctionId = params.id;

  if (!auctionId) {
    return NextResponse.json({ success: false, error: "Auction ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("auctions")
    .delete()
    .eq("id", auctionId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Auction deleted successfully" });
}
