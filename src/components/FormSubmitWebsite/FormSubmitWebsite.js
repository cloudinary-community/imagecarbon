import { useRouter } from 'next/router';

import { cleanUrl } from '@/lib/util';

import Form from '@/components/Form';
import FormRow from '@/components/FormRow';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

import styles from './FormSubmitWebsite.module.scss';

const FormSubmitWebsite = ({ className, ...rest }) => {
  const router = useRouter();

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
    
    if ( url ) {
      // Make the URLs look a little better by stripping the protocol and trailing slashes

      url = cleanUrl(url);

      url = encodeURIComponent(url);

      router.push(`sites/${url}`);
    }
  }

  return (
    <Form className={formClassName} onSubmit={handleOnSubmit} {...rest}>
      <FormRow>
        <FormInput type="text" name="url" placeholder="mywebsite.com" />
      </FormRow>
      <FormRow>
        <Button>Calculate Emissions</Button>
      </FormRow>
    </Form>
  );
};

export default FormSubmitWebsite;
