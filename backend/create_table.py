import boto3

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')

# Define the table structure
table = dynamodb.create_table(
    TableName='AxiomBookings',
    KeySchema=[
        {
            'AttributeName': 'id',
            'KeyType': 'HASH'  # Partition key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'id',
            'AttributeType': 'S'  # String (we will use UUIDs for IDs)
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

print("Provisioning 'AxiomBookings' table in AWS ap-southeast-1...")
# Pause the script until AWS confirms the table is built
table.meta.client.get_waiter('table_exists').wait(TableName='AxiomBookings')
print("Table created successfully! Your cloud database is live.")
