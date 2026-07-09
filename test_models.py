import boto3
from botocore.exceptions import ClientError

def test_models_in_region(region):
    print(f"\n--- Testing region {region} ---")
    try:
        bedrock = boto3.client('bedrock', region_name=region)
        runtime = boto3.client('bedrock-runtime', region_name=region)
        
        response = bedrock.list_foundation_models()
        models = [m for m in response.get('modelSummaries', []) if 'TEXT' in m.get('outputModalities', [])]
        
        success = False
        for m in models:
            model_id = m['modelId']
            if "embed" in model_id.lower() or "image" in model_id.lower():
                continue
            
            try:
                res = runtime.converse(
                    modelId=model_id,
                    messages=[{"role": "user", "content": [{"text": "hi"}]}]
                )
                print(f"[SUCCESS] Model {model_id} is usable!")
                success = True
                break
            except ClientError as e:
                err_code = e.response['Error']['Code']
                err_msg = e.response['Error']['Message']
                if err_code == "ValidationException" and "Operation not allowed" in err_msg:
                    pass
                elif err_code == "AccessDeniedException":
                    pass
                else:
                    pass
            except Exception as e:
                pass
        
        if not success:
            print(f"No usable TEXT models found in {region} (Account restricted).")
    except Exception as e:
        print(f"Error accessing region {region}: {str(e)}")

test_models_in_region('ap-southeast-1')
test_models_in_region('us-east-1')
