import { useState } from 'react';
import { useRouter } from 'next/router';

import { cleanUrl, restoreUrl, isValidUrl } from '@/lib/util';
import { cn } from '@/lib/cn';

import Form from '@/components/Form';
import FormRow from '@/components/FormRow';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

const FormSubmitWebsite = ({ id = 'website-input', className, ...rest }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState();
  const [error, setError] = useState();

  function handleOnSubmit(e) {
    e.preventDefault();

    const fields = Array.from(e.currentTarget.elements);
    const values = fields.filter(({ name }) => !!name).map((field) => {
      return {
        name: field.name,
        value: field.value,
      };
    });

    let url = values.find(({ name }) => name === 'url')?.value;

    const isValid = isValidUrl(restoreUrl(url));

    if (!isValid) {
      setError('Please enter a valid URL.');
      return;
    }

    setIsLoading(true);

    if (url) {
      url = cleanUrl(url);
      url = encodeURIComponent(url);
      router.push(`/site?url=${url}`);
    }
  }

  function handleOnInputChange() {
    setError();
  }

  return (
    <Form
      className={cn(
        'relative mx-auto max-w-[20em] pb-4 text-base sm:text-xl lg:text-[1.4em] [&_button]:w-full [&_input]:w-full [&_input]:text-center',
        className
      )}
      onSubmit={handleOnSubmit}
      {...rest}
    >
      <FormRow>
        <FormInput
          type="text"
          name="url"
          placeholder="mywebsite.com"
          id={id}
          label="Enter a website address to test"
          onChange={handleOnInputChange}
        />
      </FormRow>
      <FormRow>
        <Button disabled={isLoading}>Calculate Emissions</Button>
      </FormRow>
      <FormRow className="absolute left-0 right-0 top-full z-10 w-full -mt-2 [&_p]:text-sm">
        {error && <p>{error}</p>}
      </FormRow>
    </Form>
  );
};

export default FormSubmitWebsite;
