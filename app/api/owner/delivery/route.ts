import { drainInquiryEmails } from '@/lib/server/inquiry-delivery';
import { isDeliveryRunner, privateHeaders } from '@/lib/server/owner-auth';

export async function POST(request: Request) {
  if (!(await isDeliveryRunner(request)))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401, headers: privateHeaders() },
    );
  const result = await drainInquiryEmails({ limit: 20 });
  return Response.json(result, { headers: privateHeaders() });
}
