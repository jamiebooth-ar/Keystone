import requests
import json

ACCESS_TOKEN = os.getenv("HUBSPOT_ACCESS_TOKEN", "your_token_here")

def debug_hubspot_response():
    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    params = {
        'limit': 3, 
        'properties': ["firstname", "lastname", "email", "phone", "company", "jobtitle"]
    }

    print(f"GET {url}")
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print(f"\nSUCCESS. Retrieved {len(results)} sample records.")
            
            for i, contact in enumerate(results):
                props = contact.get('properties', {})
                print(f"\n[Contact #{i+1}] ID: {contact.get('id')}")
                print(f"  Name: {props.get('firstname')} {props.get('lastname')}")
                print(f"  Email: {props.get('email')}")
                print(f"  Phone: {props.get('phone')}")
                print(f"  Company: {props.get('company')}")
                print(f"  Job: {props.get('jobtitle')}")
                
        else:
            print(f"Error: {response.text}")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    debug_hubspot_response()
