'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { SiteLink as Link } from '@/components/site-link';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import {
  emptyInquiry,
  inquirySchema,
  photoLimits,
  photoTypes,
  type Inquiry,
} from '@/lib/inquiry';
import { services, serviceSlugs } from '@/lib/services';

type ModelContext = {
  registerTool(
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute(input: unknown): unknown;
    },
    options: { signal: AbortSignal },
  ): void | Promise<void>;
};
const stageSchema = inquirySchema.partial().strict();

export function InquiryForm() {
  const params = useSearchParams();
  const selected = params.get('service');
  const [values, setValues] = useState<Inquiry>({
    ...emptyInquiry,
    service: serviceSlugs.includes(selected as Inquiry['service'])
      ? (selected as Inquiry['service'])
      : 'not-sure',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [received, setReceived] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const requestId = useRef('');
  const busyRef = useRef(false);
  const uncertainRef = useRef(false);
  const resultRef = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    if (received) resultRef.current?.focus();
  }, [received]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context?.registerTool || received) return;
    const lifecycle = new AbortController();
    const properties = Object.fromEntries(
      Object.keys(emptyInquiry).map((key) => [
        key,
        key === 'service'
          ? { type: 'string', enum: serviceSlugs }
          : { type: 'string', maxLength: key === 'description' ? 4000 : 1500 },
      ]),
    );
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'prepare_project_inquiry',
            title: 'Prepare an Aloria project inquiry',
            description:
              'Fill the visible project inquiry form for review. Does not submit the inquiry or upload photos. Service must use a listed slug. The person can review and send the form themselves.',
            inputSchema: {
              type: 'object',
              properties,
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute(input) {
              if (busyRef.current)
                return {
                  error: 'Please wait for the current submission to finish.',
                };
              const parsed = stageSchema.safeParse(input);
              if (!parsed.success)
                return {
                  error: 'Please check the supplied project details.',
                  fields: z.flattenError(parsed.error).fieldErrors,
                };
              if (uncertainRef.current)
                return {
                  error:
                    'Please retry the pending inquiry before editing its details.',
                };
              const staged = Object.fromEntries(
                Object.entries(parsed.data).filter(([key]) =>
                  Object.hasOwn(input as object, key),
                ),
              );
              flushSync(() => {
                setValues((current) => ({ ...current, ...staged }));
                setFieldErrors({});
                setMessage('');
              });
              return {
                status: 'prepared_for_review',
                submitted: false,
                fieldsUpdated: Object.keys(staged),
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => undefined);
    } catch {
      /* The visible form remains available if WebMCP is unsupported. */
    }
    return () => lifecycle.abort();
  }, [received]);

  function update(key: keyof Inquiry, value: string) {
    if (uncertainRef.current) return;
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: [] }));
  }
  const input = (
    key: keyof Inquiry,
    label: string,
    options: {
      required?: boolean;
      placeholder?: string;
      type?: string;
      autoComplete?: string;
      full?: boolean;
    } = {},
  ) => (
    <div className={`form-field ${options.full ? 'full-field' : ''}`} key={key}>
      <label htmlFor={key}>
        {label}
        {options.required && <span aria-hidden="true"> *</span>}
      </label>
      <Input
        id={key}
        name={key}
        value={values[key]}
        onChange={(event) => update(key, event.target.value)}
        type={options.type || 'text'}
        autoComplete={options.autoComplete || 'off'}
        placeholder={options.placeholder}
        required={options.required}
        maxLength={key === 'email' ? 254 : options.required ? 200 : 1500}
        aria-invalid={Boolean(fieldErrors[key]?.length)}
        aria-describedby={fieldErrors[key]?.length ? `${key}-error` : undefined}
      />
      {fieldErrors[key]?.length > 0 && (
        <p className="field-error" id={`${key}-error`}>
          {fieldErrors[key][0]}
        </p>
      )}
    </div>
  );
  function pickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files || []);
    if (
      picked.length > photoLimits.count ||
      picked.some(
        (file) =>
          file.size > photoLimits.each || !photoTypes.includes(file.type),
      ) ||
      picked.reduce((sum, file) => sum + file.size, 0) > photoLimits.total
    ) {
      setMessage(
        'Choose up to 4 JPG, PNG, WebP, or AVIF photos. Each must be under 5 MB, and under 15 MB altogether.',
      );
      event.target.value = '';
      setFiles([]);
      return;
    }
    setFiles(picked);
    setMessage('');
  }
  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    setMessage('');
    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const errors = z.flattenError(parsed.error).fieldErrors;
      setFieldErrors(errors);
      setMessage('Please check the highlighted fields below.');
      const first = Object.keys(errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    busyRef.current = true;
    setSending(true);
    setFieldErrors({});
    requestId.current ||= crypto.randomUUID();
    const body = new FormData();
    Object.entries(parsed.data).forEach(([key, value]) => body.set(key, value));
    body.set('requestId', requestId.current);
    body.set(
      'website',
      (formRef.current?.elements.namedItem('website') as HTMLInputElement)
        ?.value || '',
    );
    files.forEach((file) => body.append('photos', file));
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(45000),
      });
      const result = (await response.json()) as {
        received?: boolean;
        error?: string;
        fields?: Record<string, string[]>;
      };
      if (!response.ok || !result.received) {
        uncertainRef.current = false;
        setUncertain(false);
        setFieldErrors(result.fields || {});
        setMessage(
          result.error || 'Your inquiry could not be saved. Please try again.',
        );
        return;
      }
      setReceived(true);
    } catch {
      uncertainRef.current = true;
      setUncertain(true);
      setMessage(
        'We could not confirm your submission. Please retry to confirm receipt. Your answers are temporarily held as submitted so nothing is lost or sent twice.',
      );
    } finally {
      busyRef.current = false;
      setSending(false);
    }
  }
  if (received)
    return (
      <output className="inquiry-success" ref={resultRef} tabIndex={-1}>
        <span className="success-rule" />
        <p className="section-label">THANK YOU</p>
        <h2>Your project begins here.</h2>
        <p>
          Your inquiry and any photos have been received. Thank you for sharing
          your vision with Aloria.
        </p>
        <Link className="text-link" href="/services">
          EXPLORE OUR SERVICES <span aria-hidden="true">→</span>
        </Link>
      </output>
    );
  const needsPlan =
    values.service === 'space-planning' ||
    values.service === 'signature-design' ||
    values.service === 'not-sure';
  return (
    <form
      ref={formRef}
      className="inquiry-form"
      onSubmit={submit}
      noValidate
      aria-label="Project inquiry"
    >
      <p className="form-introduction">Tell us about your space.</p>
      <p className="form-help">
        Fields marked * are required. An estimate or “still deciding” is
        welcome.
      </p>
      {message && (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
      <fieldset disabled={sending || uncertain}>
        <legend className="sr-only">Your project details</legend>
        <div className="form-grid">
          {input('name', 'Name', { required: true, autoComplete: 'name' })}
          {input('email', 'Email', {
            required: true,
            type: 'email',
            autoComplete: 'email',
          })}
          {input('location', 'Location', {
            required: true,
            placeholder: 'City, state / country',
            autoComplete: 'address-level2',
          })}
          <div className="form-field">
            <label htmlFor="service">
              Service interested in <span aria-hidden="true">*</span>
            </label>
            <NativeSelect
              id="service"
              name="service"
              value={values.service}
              onChange={(event) => update('service', event.target.value)}
              required
              aria-invalid={Boolean(fieldErrors.service?.length)}
            >
              {services.map((service) => (
                <NativeSelectOption key={service.slug} value={service.slug}>
                  {service.title}
                </NativeSelectOption>
              ))}
              <NativeSelectOption value="not-sure">
                I’d love your guidance
              </NativeSelectOption>
            </NativeSelect>
          </div>
          {input('room', 'Room type', {
            required: true,
            placeholder: 'e.g. Living room',
          })}
          {input('dimensions', 'Approximate room dimensions', {
            required: true,
            placeholder: 'Length × width, including units',
          })}
          {input('budget', 'Budget range', {
            required: true,
            placeholder: 'Your furnishing budget, or still deciding',
          })}
          {input('timeline', 'Desired timeline', {
            required: true,
            placeholder: 'When would you like to begin?',
          })}
          <div className="form-field full-field">
            <label htmlFor="description">
              A little about your project <span aria-hidden="true">*</span>
            </label>
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              maxLength={4000}
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="What would you love to change, and how would you like your room to feel?"
              aria-invalid={Boolean(fieldErrors.description?.length)}
              aria-describedby={
                fieldErrors.description?.length
                  ? 'description-error'
                  : undefined
              }
            />
            {fieldErrors.description?.length > 0 && (
              <p className="field-error" id="description-error">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>
        </div>
        <details className="project-details">
          <summary>
            Share a few more details <span>(optional)</span>
          </summary>
          <p className="form-help">
            These details help us understand your room. Share what you have
            ready.
          </p>
          <div className="form-grid">
            {needsPlan && (
              <>
                {input('ceiling', 'Ceiling height', {
                  placeholder: 'Include measurement units',
                })}
                {input('windows', 'Window dimensions')}
                {input('doors', 'Door dimensions')}
                {input('doorSwing', 'Door swing directions')}
                {input('outlets', 'Important outlets or fixed features', {
                  full: true,
                })}
                {input('roomUse', 'How will the room be used?')}
                {input('occupants', 'Number of people using the room')}
              </>
            )}
            {input('furniture', 'Existing furniture and measurements', {
              full: true,
            })}
            {input('style', 'Preferred styles', { full: true })}
            {input('inspiration', 'Inspiration or Pinterest board', {
              full: true,
              placeholder: 'Paste a link or describe what inspires you',
            })}
            {input('colorsLove', 'Colors you love')}
            {input('colorsAvoid', 'Colors you would like to avoid')}
            {input('keep', 'Existing elements that must remain', {
              full: true,
            })}
          </div>
        </details>
        <div className="photo-upload">
          <label htmlFor="photos">
            Room photos <span>(optional)</span>
          </label>
          <p className="form-help" id="photo-help">
            Photos from each corner are especially helpful. Up to 4 JPG, PNG,
            WebP, or AVIF images; 5 MB each, 15 MB total.
          </p>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={pickFiles}
            aria-describedby="photo-help"
          />
          {files.length > 0 && (
            <div className="selected-photos">
              <ul>
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>{file.name}</li>
                ))}
              </ul>
              <button
                type="button"
                className="remove-photos"
                onClick={() => {
                  setFiles([]);
                  const element =
                    formRef.current?.querySelector<HTMLInputElement>('#photos');
                  if (element) element.value = '';
                }}
              >
                Remove photos
              </button>
            </div>
          )}
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <p className="form-privacy">
          Your details and photos are shared privately with Aloria to understand
          and respond to your project inquiry.
        </p>
      </fieldset>
      <Button
        type="submit"
        className="solid-button submit-button"
        disabled={sending}
      >
        {sending ? 'SENDING YOUR INQUIRY…' : 'SEND YOUR INQUIRY'}{' '}
        {!sending && <span aria-hidden="true">→</span>}
      </Button>
    </form>
  );
}
