import { useState } from 'react';
import { useRouter } from 'next/router';

import { cleanUrl, restoreUrl, isValidUrl } from '@/lib/util';

import Form from '@/components/Form';
import FormRow from '@/components/FormRow';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

import styles from './FormSubmitWebsite.module.scss';

const FormSubmitWebsite = ({ className, ...rest }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState();
  const [error, setError] = useState();

  let formClassName = styles.formSubmitWebsite;

  if ( className ) {
    formClassName = `${formClassName} ${className}`;
  }

  function handleOnSubmit(e) {
    e.preventDefault();

    const fields = Array.from(e.currentTarget.elements);
    const values = fields.filter(({ name }) => !!name).map(field => {
      return {
        name: field.name,
        value: field.value
      }
    });
    
    let url = values.find(({ name }) => name === 'url')?.value;

    // First check if it's a valid domain / URL

    const isValid = isValidUrl(restoreUrl(url));

    if ( !isValid ) {
      setError('Please enter a valid URL.');
      return;
    }

    // If it is, continue with submission

    setIsLoading(true);
    
    if ( url ) {
      // Make the URLs look a little better by stripping the protocol and trailing slashes

      url = cleanUrl(url);

      url = encodeURIComponent(url);

      router.push(`/site?url=${url}`);
    }
  }

  function handleOnInputChange() {
    setError();
  }

  return (
    <Form className={formClassName} onSubmit={handleOnSubmit} {...rest}>
      <FormRow>
        <FormInput type='text' name='url' placeholder='mywebsite.com' id='website-input' label='Enter a website address to test' onChange={handleOnInputChange} />
      </FormRow>
      <FormRow>
        <Button disabled={isLoading}>Calculate Emissions</Button>
      </FormRow>
      <FormRow className={styles.formRowError}>
        {error && (
          <p>{ error }</p>
        )}
      </FormRow>
    </Form>
  );
};

export default FormSubmitWebsite;
